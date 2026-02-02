import { Option } from './Option';
import { Actor } from './Actor';
import { ScriptManager } from './ScriptManager';

export class Encounter {
    public id: string = '';
    public title: string = '';
    public options: Option[] = [];
    public creation_time: number = 0;
    public modified_time: number = 0;
    public earliest_turn: number = 0;
    public latest_turn: number = 0;
    public antagonist: Actor | null = null;
    public word_count: number = 0;
    public desirability_script: ScriptManager = new ScriptManager();
    public acceptability_script: ScriptManager = new ScriptManager();
    public occurrences: number = 0;

    constructor(id: string = '', title: string = '') {
        this.id = id;
        this.title = title;
    }

    public compile(): any {
        return {
            id: this.id,
            title: this.title,
        }
    }

    public set_as_copy_of(original: Encounter): void {
        this.id = original.id;
        this.title = original.title;
        this.options = original.options;
        this.creation_time = original.creation_time;
        this.modified_time = original.modified_time;
        this.earliest_turn = original.earliest_turn;
        this.latest_turn = original.latest_turn;
        this.antagonist = original.antagonist;
        this.word_count = original.word_count;
        this.desirability_script = original.desirability_script;
        this.acceptability_script = original.acceptability_script;
        this.occurrences = original.occurrences;
    }
}
