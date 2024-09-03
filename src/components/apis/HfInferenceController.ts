import { HfInference } from '@huggingface/inference';
import { LLM } from '../../types/GPT.type';
import logger from '../../utils/logger';
import { LLMControllerInterface } from './LLMControllerInterface';

export class HfInferenceController implements LLMControllerInterface {
    private static instance: HfInferenceController;
    private static apiInstance: HfInference;
    private static readonly MAX_TOKENS = 1000;
    private static model: LLM.HFModel; //default model set in constructor
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
            this.model = LLM.HFModel.GPT2;
        } else {
            logger.debug(
                'Returning existing instance of HfInferenceController.',
            );
        }

        return HfInferenceController.instance;
    }

    public static setModel(model: LLM.HFModel) {
        this.model = model;
    }

    public ask(userMessages: LLM.Message[]): Promise<string> {
        return new Promise((resolve, reject) => {
            logger.debug(`Using model: ${HfInferenceController.model}`);
            logger.debug(
                `Sending question to HF model:\n${JSON.stringify(
                    userMessages.map((message) => ({
                        ...message,
                        content: message.content,
                    })),
                    null,
                    2, // Adds indentation for better readability
                ).replace(/\\n/g, '\n')}`, // Replace \n in the JSON output itself
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
}
