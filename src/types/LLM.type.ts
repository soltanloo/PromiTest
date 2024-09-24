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
        // instruct models
        //LLAMA_3_1_70B = 'meta-llama/Meta-Llama-3.1-70B-Instruct',
        //LLAMA_3_1_8B = 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        PHI_3_MINI_4k = 'microsoft/Phi-3-mini-4k-instruct',
        MISTRAL_7B = 'mistralai/Mistral-7B-Instruct-v0.3',
        MISTRAL_8X7B = 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        //QWEN2_0_5B = 'Qwen/Qwen2-0.5B',
        //YI_CODER_9B = "01-ai/Yi-Coder-9B-Chat",
        //C4AI_COMMAND_R = "CohereForAI/c4ai-command-r-08-2024",
        //HERMES_3_LLAMA_3_1_8B = "NousResearch/Hermes-3-Llama-3.1-8B",
        //QWEN2_72B = "Qwen/Qwen2-72B-Instruct",

        // api plaintext request-response models
        // STARCODER = 'bigcode/starcoder', cannot do instructions, can only predict code. see https://huggingface.co/bigcode/starcoder limitations section.
        //GRABBE = 'grabbe-gymnasium-detmold/grabbe-ai', //Not accessable on huggingface at the moment 2024-09-06
    }

    export const chatCompletionModels = new Set<HFModel>([
        //HFModel.LLAMA_3_1_70B, // premium
        //HFModel.LLAMA_3_1_8B, // premium
        HFModel.PHI_3_MINI_4k, //works
        HFModel.MISTRAL_7B, //works
        HFModel.MISTRAL_8X7B, //works
        //HFModel.QWEN2_0_5B, //never sends a response
        //HFModel.YI_CODER_9B, //too large
        //HFModel.C4AI_COMMAND_R, //too large
        //HFModel.HERMES_3_LLAMA_3_1_8B, //too large
        //HFModel.QWEN2_72B, //too large
    ]);

    export const apiPlaintextModels = new Set<HFModel>([
        // HFModel.STARCODER,
        //HFModel.GRABBE, // doesnt work
    ]);

    export function messagesToString(messages: LLM.Message[]): string {
        return messages.map((message) => message.content).join('\n');
    }
}
