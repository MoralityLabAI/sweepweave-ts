import { SWPointer } from './SWPointer';
import { sw_script_data_types } from './SWScriptElement';

/**
 * A pointer that holds a constant boolean value (true or false).
 * This is useful for script construction and for getting the parent of a constant.
 * Ported from Godot/GDScript.
 */
export class BooleanConstant extends SWPointer {

    public value: boolean | null = null;

    constructor(in_value: any) {
        super();
        this.pointer_type = "Boolean Constant";
        this.output_type = sw_script_data_types.BOOLEAN;
        this.set_value(in_value);
    }

    public override get_value(leaf: any = null): boolean | null {
        return this.value;
    }

    public set_value(in_value: any): void {
        if (typeof in_value === 'boolean') {
            this.value = in_value;
        } else {
            console.error("Cannot set a boolean constant to a non-boolean value.");
            this.value = null;
        }
    }

    /**
     * Compiles the constant down to its raw boolean value.
     */
    public override compile(parent_storyworld: any, include_editor_only_variables: boolean = false): boolean | null {
        return this.value;
    }

    public override data_to_string(): string {
        return String(this.value);
    }
}
