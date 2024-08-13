import OpenAI from 'openai';
import logger from '../../utils/logger';

export class GPTController {
    private static instance: GPTController;
    private static apiInstance: OpenAI;
    private static readonly MAX_TOKENS = 1000;

    constructor() {
        GPTController.apiInstance = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        logger.info('GPTController initialized with OpenAI API.');
    }

    public static getInstance(): GPTController {
        if (!GPTController.instance) {
            logger.debug('Creating new instance of GPTController.');
            GPTController.instance = new GPTController();
        } else {
            logger.debug('Returning existing instance of GPTController.');
        }

        return GPTController.instance;
    }

    public ask(question: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const params: OpenAI.Chat.ChatCompletionCreateParams = {
                messages: [
                    { role: 'user', content: question }
                ],
                model: 'gpt-4o-mini',
                max_tokens: GPTController.MAX_TOKENS
            };

            logger.debug(`Sending question to GPT model: \n ${question}`);

            GPTController.apiInstance.chat.completions.create(params)
                .then((res) => {
                    const responseContent = res.choices[0]?.message?.content;

                    if (!responseContent) {
                        logger.error('No response received from GPT model.');
                        reject(new Error('No response'));
                    } else {
                        logger.info(`Received response from GPT model: ${ responseContent }`);
                        resolve(responseContent);
                    }
                })
                .catch((err) => {
                    logger.error(`Error occurred while communicating with GPT model. ${ err.message }`);
                    reject(err);
                });
        });
    }
}