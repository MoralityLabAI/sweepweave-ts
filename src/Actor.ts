import { BNumberBlueprint } from "./BNumberBlueprint";
import { Storyworld } from "./Storyworld";

/**
 * STUB
 * This is a placeholder for the Actor class.
 * It will be replaced with a full implementation when Actor.gd is ported.
 */
export class Actor {
    public id: string = '';
    public char_name: string = '';
    public bnumber_properties: Map<string, number> = new Map();
    public authored_property_directory: Map<string, BNumberBlueprint> = new Map();
    public storyworld: Storyworld | null = null;

    constructor(id: string = '', char_name: string = '') {
        this.id = id;
        this.char_name = char_name;
    }

    public get_bnumber_property(): number {
        console.warn("STUB: Actor.get_bnumber_property called");
        return 0; // Placeholder
    }

    public set_bnumber_property(): void {
        console.warn("STUB: Actor.set_bnumber_property called");
    }

    public compile(): any {
        // console.warn("STUB: Actor.compile called"); // Removed console.warn
        return {
            id: this.id,
            // Add other properties that would be serialized if needed
            name: this.char_name,
            bnumber_properties: Object.fromEntries(this.bnumber_properties)
        };
    }

    public set_as_copy_of(original: this): void {
        this.id = original.id;
        this.char_name = original.char_name;
        this.bnumber_properties = new Map(original.bnumber_properties);
    }

    public get_index(): number {
        if (this.storyworld) {
            return this.storyworld.characters.indexOf(this);
        }
        return -1;
    }
}