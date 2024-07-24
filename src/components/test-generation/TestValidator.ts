// @ts-ignore
import {parse} from 'espree';

export default class TestValidator {
    static cleanCodeBlocks(text: string): string {
        // Use a regular expression to remove the code block markers
        return text.replace(/```[a-z]*\n/g, '').replace(/```/g, '');
    }

    static validateSyntax(text: string): boolean {
        try {
            parse(text);
            return true;
        } catch (e) {
            return false;
        }
    }
}