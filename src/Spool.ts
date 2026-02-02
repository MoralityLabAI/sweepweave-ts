/**
 * STUB
 * This is a placeholder for the Spool class.
 * It will be replaced with a full implementation when Spool.gd is ported.
 */
export class Spool {
    public id: string = '';

    constructor(id: string = '') {
        this.id = id;
    }

    public set_as_copy_of(original: Spool): void {
        this.id = original.id;
    }

    public compile(): any {
        return {
            id: this.id,
        }
    }
}
