import OpenAI from 'openai';
import logger from '../../logging/logger';

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
            logger.debug('Sending question to GPT model:', {message: question});

            GPTController.apiInstance.chat.completions.create(params)
                .then((res) => {
                    if (!res.choices[0].message.content) {
                        logger.error('No response received from GPT model');
                        reject(new Error('No response'));
                    } else {
                        logger.info('Received response from GPT model:', {message: res.choices[0].message.content});
                        resolve(res.choices[0].message.content);
                    }
                })
                .catch((err) => {
                    logger.error('Error occurred while communicating with GPT model:', {message: err});
                    throw err;
                })
        });
    }

}