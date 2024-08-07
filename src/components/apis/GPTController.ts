import OpenAI from 'openai';

export class GPTController {
    private static instance: GPTController;
    private static apiInstance: OpenAI
    private static readonly MAX_TOKENS = 1000;

    constructor() {
        GPTController.apiInstance = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    public static getInstance(): GPTController {
        if (!GPTController.instance) {
            GPTController.instance = new GPTController();
        }

        return GPTController.instance;
    }

    public ask(question: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const params: OpenAI.Chat.ChatCompletionCreateParams = {
                messages: [
                    //     {
                    //     role: 'system',
                    //     content: 'You are an expert JavaScript developer who can write tests to increase the coverage of the program.'
                    // },
                    {role: 'user', content: question}],
                model: 'gpt-4o-mini',
                max_tokens: GPTController.MAX_TOKENS
            };

            GPTController.apiInstance.chat.completions.create(params)
                .then((res) => {
                    if (!res.choices[0].message.content) {
                        reject(new Error('No response'));
                    } else {
                        resolve(res.choices[0].message.content);
                    }
                })
                .catch((err) => {
                    throw err;
                })
        });
    }

}