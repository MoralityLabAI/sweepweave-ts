import { SWScriptElement } from "./SWScriptElement";

export class ScriptManager {
    public script_elements: SWScriptElement[] = [];

    constructor() {
    }

    public get_value(): any {
        let last_output: any = null;
        for (const element of this.script_elements) {
            last_output = element.get_value();
        }
        return last_output;
    }

    public add_script_element(element: SWScriptElement): void {
        this.script_elements.push(element);
    }

    public remove_script_element(element: SWScriptElement): void {
        const index = this.script_elements.indexOf(element);
        if (index > -1) {
            this.script_elements.splice(index, 1);
        }
    }

    public set_as_copy_of(): void {
    }

    public remap(): boolean {
        return true;
    }

    public to_string(): string {
        let output = "";
        for (const element of this.script_elements) {
            output += element.data_to_string() + "\n";
        }
        return output;
    }

    public compile(): any {
        const output: any[] = [];
        for (const element of this.script_elements) {
            output.push(element.compile());
        }
        return output;
    }

    public load_from_json_v0_0_21(): boolean {
        return true;
    }

    public clear(): void {
        this.script_elements = [];
    }

    public data_to_string(): string {
        return this.to_string();
    }
}
