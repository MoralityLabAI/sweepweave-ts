import { SWScriptElement } from './SWScriptElement';

/**
 * A pointer, for use in SweepWeave scripts.
 * Ported from Godot/GDScript.
 */
export class SWPointer extends SWScriptElement {
    public pointer_type: string = "Generic Pointer";

    constructor() {
        super();
    }

    public override data_to_string(): string {
        return "SweepWeave Pointer";
    }

    /**
     * Compiles the pointer into a JSON-serializable object.
     * This method intentionally overrides the base class method completely,
     * as per the original GDScript implementation.
     * @param parent_storyworld The parent storyworld.
     * @param include_editor_only_variables Flag to include editor-only data.
     */
    public override compile(parent_storyworld: any, include_editor_only_variables: boolean = false): Record<string, any> {
        const output: Record<string, any> = {};
        output["script_element_type"] = "Pointer";
        output["pointer_type"] = this.pointer_type;
        return output;
    }
}
