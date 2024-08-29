import { GPT } from "../../types/GPT.type";

export interface LLMControllerInterface {
    ask(userMessages: GPT.Message[]): Promise<string>;
}
