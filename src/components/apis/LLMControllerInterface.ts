import { LLM } from '../../types/GPT.type';

export interface LLMControllerInterface {
    ask(userMessages: LLM.Message[]): Promise<string>;
}
