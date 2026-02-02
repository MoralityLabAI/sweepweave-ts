import { InclinationSorter } from '../src/InclinationSorter';

describe('InclinationSorter', () => {
    // InclinationSorter contains only static methods, so it should not be instantiated.

    it('should correctly sort items in ascending order of inclination (primary sort key)', () => {
        const items: [any, number, number][] = [
            [{ id: 'item1' }, 0.5, 0],
            [{ id: 'item2' }, 0.9, 0],
            [{ id: 'item3' }, 0.1, 0],
        ];
        const sortedItems = [...items].sort(InclinationSorter.sort_ascending);

        expect(sortedItems[0][0].id).toBe('item3');
        expect(sortedItems[1][0].id).toBe('item1');
        expect(sortedItems[2][0].id).toBe('item2');
    });

    it('should sort items in ascending order, using original index for ties (secondary sort key)', () => {
        const items: [any, number, number][] = [
            [{ id: 'itemA' }, 0.5, 2], // Original index 2
            [{ id: 'itemB' }, 0.1, 0], // Original index 0
            [{ id: 'itemC' }, 0.5, 1], // Original index 1
        ];
        const sortedItems = [...items].sort(InclinationSorter.sort_ascending);

        expect(sortedItems[0][0].id).toBe('itemB'); // 0.1
        expect(sortedItems[1][0].id).toBe('itemA'); // 0.5, index 2 (larger index, so comes first for descending original index sort)
        expect(sortedItems[2][0].id).toBe('itemC'); // 0.5, index 1
    });

    it('should correctly sort items in descending order of inclination (primary sort key)', () => {
        const items: [any, number, number][] = [
            [{ id: 'item1' }, 0.5, 0],
            [{ id: 'item2' }, 0.9, 0],
            [{ id: 'item3' }, 0.1, 0],
        ];
        const sortedItems = [...items].sort(InclinationSorter.sort_descending);

        expect(sortedItems[0][0].id).toBe('item2');
        expect(sortedItems[1][0].id).toBe('item1');
        expect(sortedItems[2][0].id).toBe('item3');
    });

    it('should sort items in descending order, using original index for ties (secondary sort key)', () => {
        const items: [any, number, number][] = [
            [{ id: 'itemA' }, 0.5, 2], // Original index 2
            [{ id: 'itemB' }, 0.9, 0], // Original index 0
            [{ id: 'itemC' }, 0.5, 1], // Original index 1
        ];
        const sortedItems = [...items].sort(InclinationSorter.sort_descending);

        expect(sortedItems[0][0].id).toBe('itemB'); // 0.9
        expect(sortedItems[1][0].id).toBe('itemC'); // 0.5, index 1 (smaller index, so comes first for ascending original index sort)
        expect(sortedItems[2][0].id).toBe('itemA'); // 0.5, index 2
    });
});