import { ContentSelectionQueue } from '../src/ContentSelectionQueue';

describe('ContentSelectionQueue', () => {
    let queue: ContentSelectionQueue;

    beforeEach(() => {
        queue = new ContentSelectionQueue();
    });

    it('should be instantiated as empty', () => {
        expect(queue.get_num_items()).toBe(0);
        expect(queue.is_empty()).toBe(true);
    });

    it('should correctly add and retrieve a single item', () => {
        queue.add_item({ id: 'item1', priority: 1 });
        expect(queue.get_num_items()).toBe(1);
        expect(queue.is_empty()).toBe(false);

        const item = queue.get_item(0);
        expect(item).toEqual({ id: 'item1', priority: 1 });
    });

    it('should correctly add multiple items and maintain order', () => {
        queue.add_item({ id: 'item1', priority: 1 });
        queue.add_item({ id: 'item2', priority: 2 });
        queue.add_item({ id: 'item3', priority: 0 });

        expect(queue.get_num_items()).toBe(3);
        expect(queue.get_item(0)).toEqual({ id: 'item1', priority: 1 });
        expect(queue.get_item(1)).toEqual({ id: 'item2', priority: 2 });
        expect(queue.get_item(2)).toEqual({ id: 'item3', priority: 0 });
    });

    it('should remove an item by index', () => {
        queue.add_item({ id: 'item1', priority: 1 });
        queue.add_item({ id: 'item2', priority: 2 });
        queue.remove_item(0);

        expect(queue.get_num_items()).toBe(1);
        expect(queue.get_item(0)).toEqual({ id: 'item2', priority: 2 });
    });

    it('should clear the queue', () => {
        queue.add_item({ id: 'item1', priority: 1 });
        queue.add_item({ id: 'item2', priority: 2 });
        queue.clear();

        expect(queue.get_num_items()).toBe(0);
        expect(queue.is_empty()).toBe(true);
    });

    // TODO: Add tests for more complex scenarios, e.g.,
    // - Removing non-existent items
    // - Behavior with negative priorities or non-numeric priorities (if applicable)
    // - Integration with actual content selection logic (if ContentSelectionQueue manages more than just storage)
});
