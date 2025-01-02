import OpenAI from 'openai';
import logger from '../../utils/logger';
import { LLMControllerInterface } from './LLMControllerInterface';
import { LLM } from '../../types/LLM.type';
import dotenv from 'dotenv';

dotenv.config();

export class GPTController implements LLMControllerInterface {
    private static instance: GPTController;
    private static apiInstance: OpenAI;
    private static readonly MAX_TOKENS = 5000;
    private static model: LLM.GPTModel; // Default model set in constructor
    private static readonly RATE_LIMIT_DELAY = 10000; // Initial delay in ms for retries
    private static readonly RETRY_LIMIT = 5; // Max retries for rate-limited requests

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
            this.model = LLM.GPTModel.GPT4O;
        } else {
            logger.debug('Returning existing instance of GPTController.');
        }

        return GPTController.instance;
    }

    public static setModel(model: LLM.GPTModel) {
        this.model = model;
    }

    public async ask(userMessages: LLM.Message[]): Promise<string> {
        const params: OpenAI.Chat.ChatCompletionCreateParams = {
            messages: userMessages,
            model: GPTController.model,
            max_tokens: GPTController.MAX_TOKENS,
        };

        logger.debug(
            `Sending question to GPT model:\n${JSON.stringify(
                userMessages.map((message) => ({
                    ...message,
                    content: message.content,
                })),
                null,
                2, // Adds indentation for better readability
            ).replace(/\\n/g, '\n')}`, // Replace \n in the JSON output itself
        );

        let retries = 0;

        while (retries < GPTController.RETRY_LIMIT) {
            try {
                const res =
                    await GPTController.apiInstance.chat.completions.create(
                        params,
                    );
                const responseContent = res.choices[0]?.message?.content;

                if (!responseContent) {
                    logger.error('No response received from GPT model.');
                    throw new Error('No response');
                }

                logger.info(
                    `Received response from GPT model: ${responseContent}`,
                );
                return responseContent;
            } catch (err: any) {
                if (
                    err.response?.status === 429 &&
                    retries < GPTController.RETRY_LIMIT
                ) {
                    retries++;
                    logger.warn(
                        `Rate limit exceeded. Retrying ${retries}/${GPTController.RETRY_LIMIT}...`,
                    );
                    await new Promise((resolve) =>
                        setTimeout(
                            resolve,
                            GPTController.RATE_LIMIT_DELAY * retries,
                        ),
                    );
                } else {
                    logger.error(
                        `Error occurred while communicating with GPT model: ${err.message}`,
                    );
                    throw err;
                }
            }
        }

        throw new Error('Max retries exceeded for rate-limited requests');
    }
}
