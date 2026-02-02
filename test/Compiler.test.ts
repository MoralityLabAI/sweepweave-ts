import { Compiler } from '../src/Compiler';
import { Storyworld } from '../src/Storyworld';
import { Actor } from '../src/Actor';
import { BNumberConstant } from '../src/BNumberConstant';

describe('Compiler', () => {
    let compiler: Compiler;
    let storyworld: Storyworld;
    let dummyTemplate: string; // A placeholder template string

    beforeEach(() => {
        storyworld = new Storyworld();
        storyworld.storyworld_title = "Test Storyworld Title";
        storyworld.storyworld_author = "Test Author";
        storyworld.ifid = "TEST-IFID-001";

        // Provide a basic template that the Compiler expects to replace
        dummyTemplate = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>SweepWeave Storyworld Interpreter</title>
                <meta name="author" content="Anonymous">
                <meta prefix="ifiction: http://babel.ifarchive.org/protocol/iFiction/" property="ifiction:ifid" content="">
            </head>
            <body>
                <script type="text/javascript" src="storyworld_data.js"></script>
            </body>
            </html>
        `;

        // Instantiate Compiler with correct arguments
        compiler = new Compiler(
            "var game_data = {};", // dummy game_data
            storyworld.storyworld_title,
            storyworld.storyworld_author,
            storyworld.ifid,
            dummyTemplate
        );
    });

    it('should correctly initialize its output with template replacements', () => {
        // Assert that the compiler's output property has been correctly initialized
        // and replacements have occurred.
        expect(compiler.output).toContain(`<title>${storyworld.storyworld_title}</title>`);
        expect(compiler.output).toContain(`content="${storyworld.storyworld_author}"`);
        expect(compiler.output).toContain(`content="${storyworld.ifid}"`);
    });

    // TODO: Add tests for other constant types (BooleanConstant, StringConstant - if implemented)
    // TODO: Add tests for various operator types (ArithmeticMeanOperator, AssignmentOperator, etc.)
    // TODO: Add tests for various pointer types (BNumberPointer, EventPointer, etc.)
    // TODO: Test error handling for malformed script data
});