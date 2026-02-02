import { el, clear } from '../dom';
import { Storyworld } from '../../Storyworld';
import { ScriptManager } from '../../ScriptManager';
import { BNumberConstant } from '../../BNumberConstant';
import { BNumberPointer } from '../../BNumberPointer';
import { ArithmeticNegationOperator } from '../../ArithmeticNegationOperator';
import { ProximityToOperator } from '../../ProximityToOperator';
import { SWScriptElement } from '../../SWScriptElement';

type ScriptNode =
  | { type: 'Constant'; value: number }
  | { type: 'BNumberProperty'; characterId: string; propertyId: string }
  | { type: 'ArithmeticNegation'; child: ScriptNode }
  | { type: 'ProximityTo'; left: ScriptNode; right: ScriptNode };

interface ModalOptions {
  storyworld: Storyworld;
  initialScript: ScriptManager | null;
  onConfirm: (script: ScriptManager, ast: ScriptNode) => void;
}

const paletteItems: ScriptNode['type'][] = [
  'Constant',
  'BNumberProperty',
  'ArithmeticNegation',
  'ProximityTo',
];

const nodeLabels: Record<ScriptNode['type'], string> = {
  Constant: 'Constant',
  BNumberProperty: 'BNumber Property',
  ArithmeticNegation: 'Arithmetic Negation',
  ProximityTo: 'Proximity To',
};

function createDefaultNode(): ScriptNode {
  return { type: 'Constant', value: 0 };
}

function createNode(type: ScriptNode['type'], storyworld: Storyworld): ScriptNode {
  if (type === 'Constant') {
    return { type: 'Constant', value: 0 };
  }
  if (type === 'BNumberProperty') {
    const character = storyworld.characters[0];
    const property = storyworld.authored_properties[0];
    return {
      type: 'BNumberProperty',
      characterId: character?.id ?? '',
      propertyId: property?.id ?? '',
    };
  }
  if (type === 'ArithmeticNegation') {
    return { type: 'ArithmeticNegation', child: createDefaultNode() };
  }
  return { type: 'ProximityTo', left: createDefaultNode(), right: createDefaultNode() };
}

function astFromScript(script: ScriptManager | null, storyworld: Storyworld): ScriptNode {
  const root = script?.script_elements?.[0];
  if (!root) {
    return createDefaultNode();
  }
  return convertElementToNode(root, storyworld);
}

function convertElementToNode(element: SWScriptElement, storyworld: Storyworld): ScriptNode {
  if (element instanceof BNumberConstant) {
    return { type: 'Constant', value: element.get_value() };
  }
  if (element instanceof BNumberPointer) {
    const propertyId = element.keyring[0] ?? '';
    const characterId = element.character?.id ?? '';
    return { type: 'BNumberProperty', characterId, propertyId };
  }
  if (element instanceof ArithmeticNegationOperator) {
    const child = element.operands[0] instanceof SWScriptElement
      ? convertElementToNode(element.operands[0], storyworld)
      : createDefaultNode();
    return { type: 'ArithmeticNegation', child };
  }
  if (element instanceof ProximityToOperator) {
    const left = element.operands[0] instanceof SWScriptElement
      ? convertElementToNode(element.operands[0], storyworld)
      : createDefaultNode();
    const right = element.operands[1] instanceof SWScriptElement
      ? convertElementToNode(element.operands[1], storyworld)
      : createDefaultNode();
    return { type: 'ProximityTo', left, right };
  }
  return createDefaultNode();
}

function scriptFromAst(ast: ScriptNode, storyworld: Storyworld): ScriptManager {
  const script = new ScriptManager();
  script.add_script_element(convertNodeToElement(ast, storyworld));
  return script;
}

function convertNodeToElement(node: ScriptNode, storyworld: Storyworld): SWScriptElement {
  if (node.type === 'Constant') {
    return new BNumberConstant(node.value);
  }
  if (node.type === 'BNumberProperty') {
    const actor = storyworld.character_directory.get(node.characterId) ?? null;
    return new BNumberPointer(actor, [node.propertyId]);
  }
  if (node.type === 'ArithmeticNegation') {
    return new ArithmeticNegationOperator(convertNodeToElement(node.child, storyworld));
  }
  return new ProximityToOperator(
    convertNodeToElement(node.left, storyworld),
    convertNodeToElement(node.right, storyworld)
  );
}

function getNodeLabel(node: ScriptNode, storyworld: Storyworld): string {
  if (node.type === 'Constant') {
    return `Constant (${node.value.toFixed(2)})`;
  }
  if (node.type === 'BNumberProperty') {
    const character = storyworld.character_directory.get(node.characterId);
    const property = storyworld.authored_properties.find((prop) => prop.id === node.propertyId);
    const characterName = character?.char_name || 'Unknown';
    const propertyName = property?.property_name || 'Property';
    return `${characterName} [${propertyName}]`;
  }
  return nodeLabels[node.type];
}

function getNodeByPath(root: ScriptNode, path: string[]): ScriptNode {
  let current = root;
  for (const key of path) {
    if (current.type === 'ArithmeticNegation' && key === 'child') {
      current = current.child;
    } else if (current.type === 'ProximityTo' && key === 'left') {
      current = current.left;
    } else if (current.type === 'ProximityTo' && key === 'right') {
      current = current.right;
    }
  }
  return current;
}

function replaceNodeByPath(root: ScriptNode, path: string[], next: ScriptNode): ScriptNode {
  if (path.length === 0) {
    return next;
  }
  const [key, ...rest] = path;
  if (root.type === 'ArithmeticNegation' && key === 'child') {
    root.child = replaceNodeByPath(root.child, rest, next);
  } else if (root.type === 'ProximityTo' && key === 'left') {
    root.left = replaceNodeByPath(root.left, rest, next);
  } else if (root.type === 'ProximityTo' && key === 'right') {
    root.right = replaceNodeByPath(root.right, rest, next);
  }
  return root;
}

export function openScriptModal(options: ModalOptions): void {
  const { storyworld, initialScript, onConfirm } = options;
  let ast = astFromScript(initialScript, storyworld);
  let selectedPath: string[] = [];

  const overlay = el('div', { className: 'sw-modal-overlay' });
  const modal = el('div', { className: 'sw-modal' });
  const header = el('div', { className: 'sw-modal-header', text: 'Script Editor' });
  const body = el('div', { className: 'sw-modal-body' });
  const treePane = el('div', { className: 'sw-modal-pane sw-tree-pane' });
  const palettePane = el('div', { className: 'sw-modal-pane sw-palette-pane' });
  const footer = el('div', { className: 'sw-modal-footer' });
  const okButton = el('button', { text: 'OK' });
  const cancelButton = el('button', { text: 'Cancel' });
  footer.append(okButton, cancelButton);

  const renderTree = () => {
    clear(treePane);
    const list = el('ul', { className: 'sw-tree' });
    const renderNode = (node: ScriptNode, path: string[]) => {
      const li = el('li', { className: 'sw-tree-node' });
      const label = el('div', { className: 'sw-tree-label', text: getNodeLabel(node, storyworld) });
      if (path.join('.') === selectedPath.join('.')) {
        label.classList.add('selected');
      }
      label.addEventListener('click', () => {
        selectedPath = path;
        render();
      });
      li.appendChild(label);
      const children: { node: ScriptNode; key: string }[] = [];
      if (node.type === 'ArithmeticNegation') {
        children.push({ node: node.child, key: 'child' });
      } else if (node.type === 'ProximityTo') {
        children.push({ node: node.left, key: 'left' });
        children.push({ node: node.right, key: 'right' });
      }
      if (children.length > 0) {
        const childList = el('ul', { className: 'sw-tree' });
        for (const child of children) {
          childList.appendChild(renderNode(child.node, [...path, child.key]));
        }
        li.appendChild(childList);
      }
      return li;
    };
    list.appendChild(renderNode(ast, []));
    treePane.appendChild(list);
  };

  const renderPalette = () => {
    clear(palettePane);
    const palette = el('div', { className: 'sw-palette' });
    const title = el('div', { className: 'sw-section-header', text: 'Operators' });
    palette.appendChild(title);
    paletteItems.forEach((item) => {
      const button = el('button', { text: nodeLabels[item] });
      button.addEventListener('click', () => {
        const next = createNode(item, storyworld);
        ast = replaceNodeByPath(ast, selectedPath, next);
        render();
      });
      palette.appendChild(button);
    });

    const inspector = el('div', { className: 'sw-inspector' });
    const selectedNode = getNodeByPath(ast, selectedPath);
    if (selectedNode.type === 'Constant') {
      const slider = el('input', { attrs: { type: 'range', min: '-1', max: '1', step: '0.01' } }) as HTMLInputElement;
      const input = el('input', { attrs: { type: 'number', min: '-1', max: '1', step: '0.01' } }) as HTMLInputElement;
      slider.value = String(selectedNode.value);
      input.value = String(selectedNode.value);
      const updateValue = (value: string) => {
        const numeric = Number(value);
        selectedNode.value = numeric;
        slider.value = String(numeric);
        input.value = String(numeric);
        renderTree();
      };
      slider.addEventListener('input', () => updateValue(slider.value));
      input.addEventListener('input', () => updateValue(input.value));
      inspector.append(el('div', { className: 'sw-section-header', text: 'Constant' }), slider, input);
    } else if (selectedNode.type === 'BNumberProperty') {
      const characterSelect = el('select') as HTMLSelectElement;
      const propertySelect = el('select') as HTMLSelectElement;
      for (const character of storyworld.characters) {
        const opt = el('option', { text: character.char_name || character.id, attrs: { value: character.id } }) as HTMLOptionElement;
        if (character.id === selectedNode.characterId) opt.selected = true;
        characterSelect.appendChild(opt);
      }
      for (const prop of storyworld.authored_properties) {
        const opt = el('option', { text: prop.property_name || prop.id, attrs: { value: prop.id } }) as HTMLOptionElement;
        if (prop.id === selectedNode.propertyId) opt.selected = true;
        propertySelect.appendChild(opt);
      }
      characterSelect.addEventListener('change', () => {
        selectedNode.characterId = characterSelect.value;
        renderTree();
      });
      propertySelect.addEventListener('change', () => {
        selectedNode.propertyId = propertySelect.value;
        renderTree();
      });
      inspector.append(
        el('div', { className: 'sw-section-header', text: 'BNumber Property' }),
        el('label', { text: 'Character' }),
        characterSelect,
        el('label', { text: 'Property' }),
        propertySelect
      );
    } else {
      inspector.append(el('div', { className: 'sw-section-header', text: nodeLabels[selectedNode.type] }));
    }

    palette.appendChild(inspector);
    palettePane.appendChild(palette);
  };

  const render = () => {
    renderTree();
    renderPalette();
  };

  okButton.addEventListener('click', () => {
    const script = scriptFromAst(ast, storyworld);
    onConfirm(script, ast);
    document.body.removeChild(overlay);
  });
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  body.append(treePane, palettePane);
  modal.append(header, body, footer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  render();
}
