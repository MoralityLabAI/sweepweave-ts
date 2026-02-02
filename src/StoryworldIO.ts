import { Storyworld } from "./Storyworld";

export class StoryworldIO {
    static normalize_input_text(text: string): string {
        return text.replace("var storyworld_data = ", "");
    }

    static parse_storyworld_dict(text: string): any {
        try {
            return JSON.parse(text);
        } catch (e: any) {
            console.log("Error parsing JSON: " + e.message);
            return {};
        }
    }

    static load_into_storyworld(storyworld: Storyworld, text: string): boolean {
        const normalized_text = this.normalize_input_text(text);
        const data_to_load = this.parse_storyworld_dict(normalized_text);
        if (Object.keys(data_to_load).length === 0) {
            console.log("Cannot load project file.");
            return false;
        }
        storyworld.clear();
        if (data_to_load.hasOwnProperty("sweepweave_version")) {
            storyworld.sweepweave_version_number = data_to_load.sweepweave_version;
            const version = storyworld.sweepweave_version_number.split(".");
            if (version.length === 3) {
                const major = parseInt(version[0]);
                const minor = parseInt(version[1]);
                const patch = parseInt(version[2]);
                if (major === 0 && minor === 0 && patch >= 7 && patch <= 15) {
                    storyworld.load_from_dict_v0_0_07_through_v0_0_15();
                } else if (major === 0 && minor === 0 && patch >= 21) {
                    storyworld.load_from_dict_v0_0_21();
                } else {
                    console.log("Cannot load project file.");
                    return false;
                }
            } else {
                console.log("Cannot load project file.");
                return false;
            }
        } else {
            console.log("Cannot load project file.");
            return false;
        }
        return true;
    }
}
