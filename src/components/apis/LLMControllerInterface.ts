import { LLM } from '../../types/LLM.type';

export interface LLMControllerInterface {
    ask(userMessages: LLM.Message[]): Promise<string>;
    setModel(model: LLM.Model): void;
}
