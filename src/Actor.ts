/**
 * STUB
 * This is a placeholder for the Actor class.
 * It will be replaced with a full implementation when Actor.gd is ported.
 */
export class Actor {
    public id: string = '';
    public char_name: string = 'Unnamed Actor';
    public storyworld: any = null; // To be Storyworld
    public authored_property_directory: Map<string, any> = new Map();

    public get_bnumber_property(keyring: any[]): number {
        console.warn("STUB: Actor.get_bnumber_property called");
        return 0;
    }

    public set_bnumber_property(keyring: any[], value: any): void {
        console.warn("STUB: Actor.set_bnumber_property called");
    }

    public get_index(): number {
        console.warn("STUB: Actor.get_index called");
        return -1;
    }
}
