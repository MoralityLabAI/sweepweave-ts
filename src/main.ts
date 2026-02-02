import * as Sweepweave from './sweepweave';
import { initializeStoryworldReader } from './storyworldReaderApp';

console.log("Sweepweave library loaded:", Sweepweave);

// Initialize the Storyworld Reader UI
document.addEventListener('DOMContentLoaded', () => {
  initializeStoryworldReader();
});