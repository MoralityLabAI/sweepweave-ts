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

// Removed the mock for StoryworldIO.load_into_storyworld.
// Each test file that needs to mock StoryworldIO should do so explicitly.
