import { JSDOM } from 'jsdom';
import { StoryworldIO } from '../src/StoryworldIO';
import { Storyworld } from '../src/Storyworld';

describe('Storyworld Loading', () => {
  let dom: JSDOM;

  beforeEach(() => {
    dom = new JSDOM();
    // Mock console.error to keep test output clean and handle the AI's intended requirement
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should correctly load diplo1.json into a Storyworld object', () => {
    // Embedded JSON content from your diplo1.json file
    const jsonContent = JSON.stringify({
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
    });

    const storyworld = new Storyworld();
    const success = StoryworldIO.load_into_storyworld(storyworld, jsonContent);

    expect(success).toBe(true);
    expect(storyworld.storyworld_title).toBe("Spring 1901: An English Overture");
  });
});
