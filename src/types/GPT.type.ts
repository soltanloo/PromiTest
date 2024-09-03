import OpenAI from 'openai';

export namespace LLM {
    export enum Role {
        USER = 'user',
        ASSISTANT = 'assistant',
        SYSTEM = 'system',
    }
    export type Message = {
        role: Role;
        content: string;
    };
    export enum GPTModel {
        GPT4OMINI = 'gpt-4o-mini',
        GPT4O = 'gpt-4o',
        GPT4TURBO = 'gpt-4-turbo',
        GPT4 = 'gpt-4',
        GPT35TURBO = 'gpt-3.5-turbo',
    }
    export enum HFModel {
        GPT2 = 'gpt2',
        GPT3 = 'gpt3',
    }
}
