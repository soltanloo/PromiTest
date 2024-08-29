import OpenAI from 'openai';
import logger from '../../utils/logger';
import { ThrowBypassSystemPrompt } from '../../prompt-templates/ThrowBypassSystemPrompt';
import { LLMControllerInterface } from './LLMControllerInterface';
import { GPT } from '../../types/GPT.type';
import { use } from 'chai';
export class GPTController implements LLMControllerInterface {
    private static instance: GPTController;
    private static apiInstance: OpenAI;
    private static readonly MAX_TOKENS = 1000;
    private static model: GPT.Model; //default model set in constructor

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
            this.model = GPT.Model.GPT4OMINI;
        } else {
            logger.debug('Returning existing instance of GPTController.');
        }

        return GPTController.instance;
    }

    public static setModel(model: GPT.Model) {
        this.model = model;
    }

    public ask(userMessages: GPT.Message[]): Promise<string> {
        return new Promise((resolve, reject) => {
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

            GPTController.apiInstance.chat.completions
                .create(params)
                .then((res) => {
                    const responseContent = res.choices[0]?.message?.content;

                    if (!responseContent) {
                        logger.error('No response received from GPT model.');
                        reject(new Error('No response'));
                    } else {
                        logger.info(
                            `Received response from GPT model: ${responseContent}`,
                        );
                        resolve(responseContent);
                    }
                })
                .catch((err) => {
                    logger.error(
                        `Error occurred while communicating with GPT model. ${err.message}`,
                    );
                    reject(err);
                });
        });
    }
}
