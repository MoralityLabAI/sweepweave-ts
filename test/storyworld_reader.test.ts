import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { vi } from 'vitest';

// Path to your HTML file (relative to this test file)
const htmlFilePath = './src/storyworld_reader.html';

// Embedded JSON content for valid storyworld
const validJsonContent = JSON.stringify({
  "IFID": "SW-GEN-DIPLO-0001",
  "storyworld_title": "Spring 1901: An English Overture",
  "storyworld_author": "Generated",
  "sweepweave_version": "0.1.9",
  "creation_time": 1700000000.0,
  "modified_time": 1700000000.0,
  "debug_mode": false,
  "display_mode": 1,
  "css_theme": "lilac",
  "font_size": "16",
  "language": "en",
  "rating": "general",
  "about_text": {
    "pointer_type": "String Constant",
    "script_element_type": "Pointer",
    "value": "Spring 1901. England quietly reaches out to France, trying to shape the opening tempo of the war in Europe."
  },
  "characters": [
    {
      "id": "char_england",
      "name": "England",
      "pronoun": "he",
      "bnumber_properties": {
        "Trust_Betrayal": 0,
        "Cooperative_Competitive": 0,
        "pTrust_Betrayal": {},
        "pCooperative_Competitive": {}
      }
    },
    {
      "id": "char_france",
      "name": "France",
      "pronoun": "she",
      "bnumber_properties": {
        "Trust_Betrayal": 0,
        "Cooperative_Competitive": 0,
        "pTrust_Betrayal": {},
        "pCooperative_Competitive": {}
      }
    }
  ],
  "authored_properties": [
    {
      "id": "Trust_Betrayal",
      "property_name": "Trust_Betrayal",
      "property_type": "bounded number",
      "default_value": 0,
      "depth": 0,
      "attribution_target": "all cast members",
      "affected_characters": [],
      "creation_index": 0,
      "creation_time": 1700000000.0,
      "modified_time": 1700000000.0
    },
    {
      "id": "Cooperative_Competitive",
      "property_name": "Cooperative_Competitive",
      "property_type": "bounded number",
      "default_value": 0,
      "depth": 0,
      "attribution_target": "all cast members",
      "affected_characters": [],
      "creation_index": 1,
      "creation_time": 1700000000.0,
      "modified_time": 1700000000.0
    }
  ],
  "spools": [
    {
      "id": "spool_main",
      "spool_type": "General",
      "creation_index": 0,
      "creation_time": 1700000000.0,
      "modified_time": 1700000000.0
    },
    {
      "id": "spool_secret",
      "spool_type": "General",
      "creation_index": 1,
      "creation_time": 1700000000.0,
      "modified_time": 1700000000.0
    }
  ],
  "encounters": [
    {
      "id": "page_opening",
      "title": "A Quiet Word in Brest",
      "connected_spools": ["spool_main"],
      "earliest_turn": 0,
      "latest_turn": 999,
      "text_script": {
        "pointer_type": "String Constant",
        "script_element_type": "Pointer",
        "value": "In the harbor at Brest, England's envoy meets France under the pretext of discussing merchant shipping. Both know this is really about the Channel and Germany."
      },
      "options": [
        {
          "id": "page_opening_opt1",
          "text_script": {
            "pointer_type": "String Constant",
            "script_element_type": "Pointer",
            "value": "Signal goodwill: propose a Demilitarized Zone in the English Channel and a joint eye on Germany."
          },
          "reactions": [
            {
              "id": "page_opening_opt1_rxn1",
              "text_script": {
                "pointer_type": "String Constant",
                "script_element_type": "Pointer",
                "value": "England opens with warmth and clarity. France feels the possibility of a real understanding."
              },
              "consequence_id": "page_private_talk",
              "after_effects": []
            }
          ]
        }
      ],
      "unique_id_seeds": {
        "character": 2,
        "encounter": 4,
        "option": 4,
        "reaction": 4,
        "spool": 2,
        "authored_property": 2
      }
    }
  ]
});

// We need to import the actual Storyworld class to instantiate it,
// but StoryworldIO will be mocked globally by vitest.setup.ts
import { Storyworld } from '../src/Storyworld'; 
// Import the StoryworldIO class from its mocked version if available, otherwise it will use the actual one.
// We explicitly import it here so that we can call its mocked methods.
import { StoryworldIO } from '../src/StoryworldIO';


describe('Storyworld Reader UI', () => {
  let dom: JSDOM;
  let document: Document;
  let storyworldInput: HTMLTextAreaElement;
  let loadStoryworldBtn: HTMLButtonElement;
  let outputDiv: HTMLDivElement;
  let globalConsoleErrorSpy: ReturnType<typeof vi.spyOn>; // Changed to global console

  // Helper function to simulate the logic of the button click handler
  const simulateLoadButtonClick = () => {
    const jsonContent = storyworldInput.value;
    if (!jsonContent) {
      outputDiv.textContent = 'Please paste storyworld JSON into the textarea.';
      return;
    }

    const storyworld = new Storyworld(); // Use the actual Storyworld class
    try {
      // StoryworldIO.load_into_storyworld will be the actual (non-mocked) version now
      const success = StoryworldIO.load_into_storyworld(storyworld, jsonContent);

      if (success) {
        outputDiv.textContent = `Storyworld "${storyworld.storyworld_title}" by ${storyworld.storyworld_author} loaded successfully!`;
      } else {
        outputDiv.textContent = 'Failed to load storyworld. Check console for errors.';
      }
    } catch (e: any) {
      outputDiv.textContent = `An error occurred: ${e.message}`;
      // This will now be caught by the globalConsoleErrorSpy
      console.error('Loading error:', e); 
    }
  };

  beforeEach(() => {
    const html = readFileSync(htmlFilePath, 'utf-8');
    dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
    document = dom.window.document;

    storyworldInput = document.getElementById('storyworldInput') as HTMLTextAreaElement;
    loadStoryworldBtn = document.getElementById('loadStoryworld') as HTMLButtonElement;
    outputDiv = document.getElementById('output') as HTMLDivElement;
    
    // Spy on the global console.error
    globalConsoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalConsoleErrorSpy.mockRestore();
  });

  it('should display an error if no JSON is entered', () => {
    storyworldInput.value = '';
    simulateLoadButtonClick();
    expect(outputDiv.textContent).toBe('Please paste storyworld JSON into the textarea.');
  });

  it('should successfully load a valid storyworld JSON', async () => {
    storyworldInput.value = validJsonContent;
    simulateLoadButtonClick();

    expect(outputDiv.textContent).toContain('Storyworld "Spring 1901: An English Overture" by Generated loaded successfully!');
    expect(globalConsoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should display an error for invalid JSON', () => {
    storyworldInput.value = '{ "invalid": "json" '; // Malformed JSON
    simulateLoadButtonClick();
    // Adjusted expectation to match the actual output of simulateLoadButtonClick
    expect(outputDiv.textContent).toBe('Failed to load storyworld. Check console for errors.');
    // Now this will correctly catch the console.error from StoryworldIO.parse_storyworld_dict
    expect(globalConsoleErrorSpy).toHaveBeenCalledWith('Error parsing JSON:', expect.any(Error));
  });
});
