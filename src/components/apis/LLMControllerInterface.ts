export interface LLMControllerInterface {
    ask(question: string): Promise<string>;
    verifyThrowCanBeBypassed(functionCode: string): Promise<boolean>;
}