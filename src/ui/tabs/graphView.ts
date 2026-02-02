import { el } from '../dom';
import { Store } from '../store';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

type AxisKey = 'index' | 'options' | 'reactions' | 'effects' | { propId: string };

const axisLabel = (axis: AxisKey, store: Store): string => {
  if (axis === 'index') return 'Encounter Index';
  if (axis === 'options') return 'Option Count';
  if (axis === 'reactions') return 'Reaction Count';
  if (axis === 'effects') return 'Effect Count';
  const prop = store.getState().storyworld.authored_properties.find((p) => p.id === axis.propId);
  return prop?.property_name || axis.propId;
};

const axisValue = (axis: AxisKey, encounterIndex: number, store: Store): number => {
  const storyworld = store.getState().storyworld;
  const encounter = storyworld.encounters[encounterIndex];
  if (!encounter) return 0;
  if (axis === 'index') return encounterIndex;
  if (axis === 'options') return encounter.options.length;
  if (axis === 'reactions') {
    return encounter.options.reduce((sum, option) => sum + option.reactions.length, 0);
  }
  if (axis === 'effects') {
    let count = 0;
    for (const option of encounter.options) {
      for (const reaction of option.reactions) {
        count += reaction.effects?.length ?? 0;
      }
    }
    return count;
  }
  // For authored properties, use first character's property value if present.
  const character = storyworld.characters[0];
  if (!character) return 0;
  return character.bnumber_properties.get(axis.propId) ?? 0;
};

export function renderGraphViewTab(store: Store): HTMLElement {
  const storyworld = store.getState().storyworld;
  const container = el('div', { className: 'sw-graph-view' });
  const toolbar = el('div', { className: 'sw-graph-toolbar' });
  const axisTabs = el('div', { className: 'sw-axis-tabs' });
  const axisSelectWrap = el('div', { className: 'sw-axis-select' });
  const axisReadout = el('div', { className: 'sw-axis-readout' });
  const presetWrap = el('div', { className: 'sw-axis-select' });
  const legend = el('div', { className: 'sw-graph-legend' });

  const axisOptions: AxisKey[] = [
    'index',
    'options',
    'reactions',
    'effects',
    ...storyworld.authored_properties.map((prop) => ({ propId: prop.id })),
  ];

  const makeAxisSelect = (label: string, selected: AxisKey) => {
    const wrapper = el('div', { className: 'sw-axis-group' });
    const select = el('select') as HTMLSelectElement;
    axisOptions.forEach((axis, index) => {
      const value = typeof axis === 'string' ? axis : `prop:${axis.propId}`;
      const opt = el('option', { text: axisLabel(axis, store), attrs: { value } }) as HTMLOptionElement;
      const selectedValue = typeof selected === 'string' ? selected : `prop:${selected.propId}`;
      if (selectedValue === value) opt.selected = true;
      select.appendChild(opt);
    });
    wrapper.append(el('label', { text: label }), select);
    return { wrapper, select };
  };

  let xAxis: AxisKey = axisOptions[0];
  let yAxis: AxisKey = axisOptions[1] || axisOptions[0];
  let zAxis: AxisKey = axisOptions[2] || axisOptions[0];

  const axisSelect = makeAxisSelect('Axis', xAxis);
  axisSelectWrap.append(el('label', { text: 'Axis Variable' }), axisSelect.select);

  type Preset = { name: string; axes: { x: AxisKey; y: AxisKey; z: AxisKey } };
  const presets: Preset[] = [
    { name: 'Index / Options / Reactions', axes: { x: 'index', y: 'options', z: 'reactions' } },
    { name: 'Options / Reactions / Effects', axes: { x: 'options', y: 'reactions', z: 'effects' } },
  ];
  if (storyworld.authored_properties.length >= 2) {
    presets.push({
      name: 'Prop 1 / Prop 2 / Index',
      axes: {
        x: { propId: storyworld.authored_properties[0].id },
        y: { propId: storyworld.authored_properties[1].id },
        z: 'index',
      },
    });
  }

  const presetSelect = el('select') as HTMLSelectElement;
  presets.forEach((preset, index) => {
    const opt = el('option', { text: preset.name, attrs: { value: `${index}` } }) as HTMLOptionElement;
    presetSelect.appendChild(opt);
  });
  presetWrap.append(el('label', { text: 'Presets' }), presetSelect);

  type AxisSlot = 'x' | 'y' | 'z';
  let activeAxis: AxisSlot = 'x';
  let axisState = { x: xAxis, y: yAxis, z: zAxis };

  const updateReadout = () => {
    axisReadout.textContent = `X: ${axisLabel(axisState.x, store)} | Y: ${axisLabel(axisState.y, store)} | Z: ${axisLabel(axisState.z, store)}`;
  };

  const updateSelectValue = () => {
    const current = axisState[activeAxis];
    axisSelect.select.value = typeof current === 'string' ? current : `prop:${current.propId}`;
  };

  const setActiveTab = (axis: AxisSlot) => {
    activeAxis = axis;
    Array.from(axisTabs.children).forEach((child) => child.classList.remove('active'));
    const tab = axisTabs.querySelector(`[data-axis="${axis}"]`);
    if (tab) tab.classList.add('active');
    updateSelectValue();
  };

  (['x', 'y', 'z'] as AxisSlot[]).forEach((axis) => {
    const tab = el('button', {
      className: axis === activeAxis ? 'sw-axis-tab active' : 'sw-axis-tab',
      text: `${axis.toUpperCase()} Axis`,
      attrs: { 'data-axis': axis },
    });
    tab.addEventListener('click', () => setActiveTab(axis));
    axisTabs.appendChild(tab);
  });

  legend.append(
    el('span', { className: 'sw-graph-legend-dot' }),
    el('span', { text: 'Ending Encounter' })
  );

  toolbar.append(axisTabs, axisSelectWrap, presetWrap, axisReadout, legend);

  const canvasWrap = el('div', { className: 'sw-graph-canvas' });
  container.append(toolbar, canvasWrap);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060a, 0.03);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvasWrap.clientWidth || 800, canvasWrap.clientHeight || 600);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  canvasWrap.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
  camera.position.set(0, 12, 20);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  scene.add(new THREE.AmbientLight(0x9aa7ff, 0.3));
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(8, 12, 6);
  scene.add(key);

  const axes = new THREE.AxesHelper(8);
  (axes.material as THREE.Material).opacity = 0.6;
  (axes.material as THREE.Material).transparent = true;
  scene.add(axes);

  const pointsGroup = new THREE.Group();
  scene.add(pointsGroup);

  const endingsGroup = new THREE.Group();
  scene.add(endingsGroup);

  const labelLayer = el('div', { className: 'sw-graph-label-layer' });
  canvasWrap.appendChild(labelLayer);
  let labels: { mesh: THREE.Object3D; el: HTMLDivElement }[] = [];

  const buildPoints = () => {
    pointsGroup.clear();
    endingsGroup.clear();
    labelLayer.innerHTML = '';
    labels = [];
    const encounters = storyworld.encounters;
    const values = encounters.map((_, index) => ({
      x: axisValue(axisState.x, index, store),
      y: axisValue(axisState.y, index, store),
      z: axisValue(axisState.z, index, store),
      encounter: encounters[index],
    }));
    const max = values.reduce(
      (acc, v) => ({
        x: Math.max(acc.x, Math.abs(v.x)),
        y: Math.max(acc.y, Math.abs(v.y)),
        z: Math.max(acc.z, Math.abs(v.z)),
      }),
      { x: 1, y: 1, z: 1 }
    );
    const scale = 6;
    values.forEach((v) => {
      const isEnding = v.encounter.options.length === 0;
      const geometry = new THREE.SphereGeometry(isEnding ? 0.18 : 0.12, 18, 18);
      const material = new THREE.MeshStandardMaterial({
        color: isEnding ? 0xffc86b : 0xe8ecff,
        emissive: isEnding ? 0xffc86b : 0x6a86ff,
        emissiveIntensity: isEnding ? 1.2 : 0.5,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (v.x / max.x) * scale,
        (v.y / max.y) * scale,
        (v.z / max.z) * scale
      );
      mesh.userData = { encounter: v.encounter };
      if (isEnding) {
        endingsGroup.add(mesh);
      } else {
        pointsGroup.add(mesh);
      }

      const label = el('div', {
        className: `sw-graph-label${isEnding ? ' ending' : ''}`,
        text: v.encounter.title || v.encounter.id || 'Encounter',
      }) as HTMLDivElement;
      labelLayer.appendChild(label);
      labels.push({ mesh, el: label });
    });
  };

  const updateAxes = () => {
    buildPoints();
  };

  const parseAxis = (value: string): AxisKey => {
    if (value.startsWith('prop:')) {
      return { propId: value.slice(5) };
    }
    return value as AxisKey;
  };

  axisSelect.select.addEventListener('change', () => {
    axisState = { ...axisState, [activeAxis]: parseAxis(axisSelect.select.value) };
    updateReadout();
    updateAxes();
  });

  presetSelect.addEventListener('change', () => {
    const preset = presets[Number(presetSelect.value)];
    if (!preset) return;
    axisState = { ...preset.axes };
    updateReadout();
    updateAxes();
    updateSelectValue();
  });

  buildPoints();
  updateReadout();
  updateSelectValue();

  let t = 0;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const tooltip = el('div', { className: 'sw-graph-tooltip' });
  tooltip.style.display = 'none';
  canvasWrap.appendChild(tooltip);

  const handleHover = (event: MouseEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(
      [...pointsGroup.children, ...endingsGroup.children],
      false
    );
    if (hits.length) {
      const hit = hits[0].object as THREE.Mesh;
      const encounter = hit.userData.encounter as { title?: string; id?: string } | undefined;
      const label = encounter?.title || encounter?.id || 'Untitled Encounter';
      tooltip.textContent = label;
      tooltip.style.display = 'block';
      tooltip.style.left = `${event.clientX - rect.left + 12}px`;
      tooltip.style.top = `${event.clientY - rect.top + 12}px`;
    } else {
      tooltip.style.display = 'none';
    }
  };

  renderer.domElement.addEventListener('mousemove', handleHover);
  renderer.domElement.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });

  renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(
      [...pointsGroup.children, ...endingsGroup.children],
      false
    );
    if (hits.length) {
      const hit = hits[0].object as THREE.Mesh;
      const encounter = hit.userData.encounter as { id?: string } | undefined;
      if (encounter?.id) {
        store.setState({
          selections: {
            ...store.getState().selections,
            encounterId: encounter.id,
            optionId: null,
            reactionId: null,
          },
        });
      }
    }
  });

  const animate = () => {
    t += 0.01;
    endingsGroup.children.forEach((child, index) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.7 + Math.sin(t + index) * 0.3;
    });
    labels.forEach(({ mesh, el: label }) => {
      const pos = mesh.position.clone();
      pos.project(camera);
      if (pos.z < -1 || pos.z > 1) {
        label.style.display = 'none';
        return;
      }
      const x = (pos.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
      const y = (-pos.y * 0.5 + 0.5) * renderer.domElement.clientHeight;
      if (x < 0 || y < 0 || x > renderer.domElement.clientWidth || y > renderer.domElement.clientHeight) {
        label.style.display = 'none';
        return;
      }
      label.style.display = 'block';
      label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    });
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();

  const resize = () => {
    const width = canvasWrap.clientWidth || 800;
    const height = canvasWrap.clientHeight || 600;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvasWrap);
  resize();

  return container;
}
