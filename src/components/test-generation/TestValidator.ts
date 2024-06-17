export default class TestValidator {
    static cleanCodeBlocks(text: string) {
        // Use a regular expression to remove the code block markers
        return text.replace(/```[a-z]*\n/g, '').replace(/```/g, '');
    }
}