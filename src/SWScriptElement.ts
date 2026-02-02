export enum sw_script_data_types {
    BOOLEAN,
    BNUMBER,
    VARIANT
}

/**
 * A script consists of a tree of operators and pointers.
 * This is the base class for those elements.
 * Ported from Godot/GDScript.
 */
export class SWScriptElement {
    /**
     * "parent_operator" refers to the operator or script manager containing the present operator or pointer.
     * Type will be updated once SWOperator/ScriptManager are ported.
     */
    public parent_operator: any = null;
    public script_index: number = 0;
    public output_type: sw_script_data_types = sw_script_data_types.VARIANT;
    
    /**
     * Variable for the editor view.
     */
    public treeview_node: any = null;

    constructor() {
        // _init() in Godot is the constructor.
    }

    public clear(): void {
        // Base implementation is empty.
    }

    /**
     * @param storyworld The storyworld context.
     */
    public remap(storyworld: any): boolean {
        // Base implementation returns true.
        return true;
    }

    /**
     * Some operators, particularly EventPointers and BooleanOperators that contain EventPointers, 
     * need access to the historybook. The "leaf" variable grants EventPointers this access.
     * @param leaf The historybook leaf.
     */
    public get_value(leaf: any = null): any {
        return null;
    }

    /**
     * Compiles the script element into a JSON-serializable object.
     * @param parent_storyworld The parent storyworld.
     * @param include_editor_only_variables Flag to include editor-only data.
     */
    public compile(parent_storyworld: any, include_editor_only_variables: boolean = false): Record<string, any> {
        let output: Record<string, any> = {};
        output["script_element_type"] = "Element";
        return output;
    }

    public data_to_string(): string {
        return "SweepWeave Script Element";
    }
}
