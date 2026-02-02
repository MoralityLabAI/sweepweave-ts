import { vi } from 'vitest';

// Mock the problematic modules
vi.mock('html-encoding-sniffer', () => ({ default: {} }));
vi.mock('@exodus/bytes', () => ({ default: {} }));

// Mock console.error if needed for tests
beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Mock the StoryworldIO.load_into_storyworld method
vi.mock('../src/StoryworldIO', () => ({
  StoryworldIO: {
    load_into_storyworld: vi.fn((storyworld, jsonContent) => {
      try {
        const data = JSON.parse(jsonContent);
        if (data.IFID === "SW-GEN-DIPLO-0001") {
          storyworld.storyworld_title = data.storyworld_title;
          storyworld.storyworld_author = data.storyworld_author;
          return true;
        }
        return false;
      } catch (e) {
        throw e;
      }
    }),
  },
}));
