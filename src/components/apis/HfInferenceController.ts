import { HfInference, HfInferenceEndpoint } from '@huggingface/inference';
import { LLM } from '../../types/LLM.type';
import logger from '../../utils/logger';
import { LLMControllerInterface } from './LLMControllerInterface';
import dotenv from 'dotenv';
dotenv.config();
export class HfInferenceController implements LLMControllerInterface {
    private static instance: HfInferenceController;
    private static apiInstance: HfInference;
    private static readonly MAX_TOKENS = 1000;
    private static model: LLM.Model; //default model set in constructor
    private static temperature: number = 0.1;
    private static seed: number = 0;

    constructor() {
        HfInferenceController.apiInstance = new HfInference(
            process.env.HF_INFERENCE_TOKEN,
        );
        logger.info(
            'HfInferenceController initialized with Hugging Face Inference API.',
        );
    }

    public static getInstance(): HfInferenceController {
        if (!HfInferenceController.instance) {
            logger.debug('Creating new instance of HfInferenceController.');
            HfInferenceController.instance = new HfInferenceController();
            this.model = LLM.Model.PHI_3_MINI_4k;
        } else {
            logger.debug(
                'Returning existing instance of HfInferenceController.',
            );
        }

        return HfInferenceController.instance;
    }

    public static setModel(model: LLM.Model) {
        this.model = model;
    }

    public ask(userMessages: LLM.Message[]): Promise<string> {
        logger.debug(`Using model: ${HfInferenceController.model}`);
        if (LLM.chatCompletionModels.has(HfInferenceController.model)) {
            return this.chatCompletionQuery(userMessages);
        }
        if (LLM.apiPlaintextModels.has(HfInferenceController.model)) {
            return this.apiPlaintextQuery(userMessages);
        }
        return new Promise((resolve, reject) => {
            reject(new Error('Model not supported'));
        });
    }

    private chatCompletionQuery(userMessages: LLM.Message[]): Promise<string> {
        return new Promise((resolve, reject) => {
            logger.debug(`Using model: ${HfInferenceController.model}`);
            logger.debug(
                `Sending question to HF model:\n${LLM.messagesToString(userMessages)}`, // Replace \n in the JSON output itself
            );

            HfInferenceController.apiInstance
                .chatCompletion({
                    model: HfInferenceController.model,
                    messages: userMessages,
                    max_tokens: HfInferenceController.MAX_TOKENS,
                    temperature: HfInferenceController.temperature,
                    seed: HfInferenceController.seed,
                })
                .then((res) => {
                    const responseContent = res.choices[0]?.message?.content;
                    if (!responseContent) {
                        logger.error('No response received from HF model.');
                        reject(new Error('No response'));
                    } else {
                        logger.debug(
                            `Received response from HF model:\n${responseContent}`,
                        );
                        resolve(responseContent);
                    }
                });
        });
    }

    private apiPlaintextQuery(userMessages: LLM.Message[]): Promise<string> {
        return new Promise((resolve, reject) => {
            async function query(userQuery: any) {
                return fetch(
                    'https://api-inference.huggingface.co/models/' +
                        HfInferenceController.model,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.HF_INFERENCE_TOKEN}`,
                            'Content-Type': 'application/json',
                        },
                        method: 'POST',
                        body: JSON.stringify(userQuery),
                    },
                ).then(async (response) => {
                    const jsonResponse = await response.json(); // Store the response body
                    logger.info(
                        `Received response from HF model:\n${JSON.stringify(jsonResponse)}`,
                    );
                    return jsonResponse; // Return the stored response
                });
            }

            query({ inputs: LLM.messagesToString(userMessages) })
                .then((result: any) => {
                    if (
                        result.error &&
                        result.error.includes('currently loading')
                    ) {
                        logger.warn(
                            'Model is currently loading, waiting for it to be ready',
                        );
                        query({
                            inputs: LLM.messagesToString(userMessages),
                            options: { wait_for_model: true },
                        }).then((result: any) => {
                            if (result.error) {
                                reject(new Error(result.error));
                            }
                            resolve(result);
                        });
                    } else {
                        resolve(result);
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
}
