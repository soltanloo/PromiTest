import OpenAI from 'openai';
import logger from '../../utils/logger';
import { ThrowBypassSystemPrompt } from '../../prompt-templates/ThrowBypassSystemPrompt';
import { LLMControllerInterface } from './LLMControllerInterface';
export class GPTController implements LLMControllerInterface {

    private static instance: GPTController;
    private static apiInstance: OpenAI;
    private static readonly MAX_TOKENS = 1000;
    private static model: GPTController.Models; //default model set in constructor

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
            this.model = GPTController.Models.GPT4OMINI;
        } else {
            logger.debug('Returning existing instance of GPTController.');
        }

        return GPTController.instance;
    }

    public static setModel(model: GPTController.Models) {
        this.model = model;
    }

    public ask(question: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const params: OpenAI.Chat.ChatCompletionCreateParams = {
                messages: [{ role: 'user', content: question }],
                model: GPTController.model,
                max_tokens: GPTController.MAX_TOKENS,
            };

            logger.debug(`Sending question to GPT model: \n ${question}`);

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
    public verifyThrowCanBeBypassed(functionCode: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            
            const params: OpenAI.Chat.ChatCompletionCreateParams = {
                messages: [
                    { role: 'system', content: ThrowBypassSystemPrompt },
                    { role: 'user', content: functionCode }
                ],
                model: GPTController.model,
                max_tokens: GPTController.MAX_TOKENS,
            };

            logger.debug(`Sending the following message to GPT model:\nsystem:\n ${ThrowBypassSystemPrompt}\nuser:\n ${functionCode}`);

            GPTController.apiInstance.chat.completions.create(params)
                .then((res) => {
                    const responseContent = res.choices[0]?.message?.content;

                    if (!responseContent) {
                        logger.error('No response received from GPT model.');
                        reject(new Error('No response'));
                    } else {
                        logger.info(`Received response from GPT model. Response: ${responseContent}`);
                        resolve(responseContent === 'T');
                    }
                })
                .catch((err) => {
                    logger.error('Error occurred while communicating with GPT model.', { error: err.message });
                    reject(err);
                });
        });
    }
}
export namespace GPTController {
    export enum Models {
        GPT4OMINI = 'gpt-4o-mini',
        GPT4O = 'gpt-4o',
        GPT4TURBO = 'gpt-4-turbo',
        GPT4 = 'gpt-4',
        GPT35TURBO = 'gpt-3.5-turbo'
    }
}