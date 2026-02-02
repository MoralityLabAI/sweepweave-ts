import { UUID } from './UUID';
// Node's crypto module is used for SHA1 hashing.
import { createHash } from 'crypto';

/**
 * Generates an IFID (Interactive Fiction ID).
 * Ported from Godot/GDScript.
 */
export class IFIDGenerator {

    /**
     * Creates an IFID based on a creation time.
     * @param creation_time - A value (usually a timestamp or string) to seed the ID.
     */
    public static IFID_from_creation_time(creation_time: string | number): string {
        const time_str = String(creation_time);
        const hash = createHash('sha1').update(time_str).digest('hex');
        const hash_part = hash.substring(0, 4).toUpperCase();
        
        let id = "SW-";
        id += hash_part + "-";
        id += UUID.v4();
        return id;
    }
}
