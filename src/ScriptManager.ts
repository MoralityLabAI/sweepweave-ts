import { SWScriptElement } from "./SWScriptElement";

/**
 * STUB
 * This is a placeholder for the ScriptManager class.
 * It will be replaced with a full implementation when ScriptManager.gd is ported.
 * It manages a tree of script elements.
 */
export class ScriptManager {
    public contents: any = null;
    public output_type: any = null; // In reality, an enum
    public script_changed: boolean = false;

    constructor(in_contents: any = null) {
        console.warn("STUB: ScriptManager.constructor called");
        this.contents = in_contents;
    }

    public get_value(leaf: any = null): any {
        console.warn("STUB: ScriptManager.get_value called");
        if (this.contents instanceof SWScriptElement) {
            return this.contents.get_value(leaf);
        }
        return this.contents;
    }

    public set_as_copy_of(original: ScriptManager): void {
        console.warn("STUB: ScriptManager.set_as_copy_of called");
    }

    public remap(storyworld: any): boolean {
        console.warn("STUB: ScriptManager.remap called");
        return true;
    }

    public clear(): void {
        console.warn("STUB: ScriptManager.clear called");
        this.contents = null;
    }

    public compile(parent_storyworld: any, include_editor_only_variables: boolean = false): any {
        console.warn("STUB: ScriptManager.compile called");
        return {};
    }

    public data_to_string(): string {
        console.warn("STUB: ScriptManager.data_to_string called");
        if (this.contents instanceof SWScriptElement) {
            return this.contents.data_to_string();
        }
        return String(this.contents);
    }

    public load_from_json_v0_0_21(storyworld: any, data_to_load: any): boolean {
        console.warn("STUB: ScriptManager.load_from_json_v0_0_21 called");
        return true;
    }
}
