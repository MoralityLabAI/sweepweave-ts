import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to your HTML file
const htmlFilePath = resolve(__dirname, '../src/storyworld_reader.html');
const jsonFilePath = resolve(__dirname, '../../GPTStoryworld/storyworlds/diplo1.json');

describe('Storyworld Reader UI', () => {
  let dom;
  let document;
  let storyworldInput;
  let loadStoryworldBtn;
  let outputDiv;

  beforeEach(() => {
    // Read the HTML file
    const html = readFileSync(htmlFilePath, 'utf-8');
    
    // Create a new JSDOM instance for each test
    dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
    document = dom.window.document;

    // Get references to the UI elements
    storyworldInput = document.getElementById('storyworldInput');
    loadStoryworldBtn = document.getElementById('loadStoryworld');
    outputDiv = document.getElementById('output');
  });

  it('should display an error if no JSON is entered', () => {
    loadStoryworldBtn.click();
    expect(outputDiv.textContent).toBe('Please paste storyworld JSON into the textarea.');
  });

  it('should successfully load a valid storyworld JSON', async () => {
    // Load a valid JSON content
    const validJson = readFileSync(jsonFilePath, 'utf-8');
    storyworldInput.value = validJson;

    // Click the load button
    loadStoryworldBtn.click();

    // Assert that the success message is displayed
    // Note: The actual StoryworldIO.load_into_storyworld is mocked or requires its own setup
    // For this UI test, we primarily care about the UI response to the action.
    // If StoryworldIO were properly integrated and mocked, we could assert more.
    expect(outputDiv.textContent).toContain('Storyworld "Spring 1901: An English Overture" by Generated loaded successfully!');
    expect(dom.window.console.error).not.toHaveBeenCalled(); // Ensure no errors during load
  });

  it('should display an error for invalid JSON', () => {
    storyworldInput.value = '{ "invalid": "json" '; // Malformed JSON
    loadStoryworldBtn.click();
    expect(outputDiv.textContent).toContain('An error occurred: Unexpected end of JSON input');
    expect(dom.window.console.error).toHaveBeenCalledWith('Loading error:', expect.any(Error));
  });
});
