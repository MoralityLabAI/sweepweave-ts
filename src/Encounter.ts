import { Option } from './Option'; // Forward declaration, will create Option.ts next

/**
 * STUB
 * This is a placeholder for the Encounter class.
 * It will be replaced with a full implementation when Encounter.gd is ported.
 */
export class Encounter {
    public id: string = '';
    public title: string = '';
    public options: Option[] = []; // Array of Option stubs

    constructor(id: string = '', title: string = '') {
        this.id = id;
        this.title = title;
    }
}
