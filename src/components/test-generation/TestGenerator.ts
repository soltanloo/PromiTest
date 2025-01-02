import { NodeId } from '../../types/Graph.type';
import LLMController from '../apis/LLMController';
import dotenv from 'dotenv';
import RuntimeConfig from '../configuration/RuntimeConfig';
import TestValidator from './TestValidator';

import { Prompts, Responses } from '../../types/Prompt.type';
import { PromiseFlagTypes } from '../../types/PromiseGraph.type';
import * as fs from 'node:fs';
import path from 'path';
import logger from '../../utils/logger';
import { LLM } from '../../types/LLM.type';
import {
    assistantCorrectResponse,
    systemPromisePrompt,
    UserMessageComplete,
} from '../../prompt-templates/ExperimentalPromptTemplates';

export default class TestGenerator {
    constructor() {
        dotenv.config();
    }

    static getTestFileNameForPromise(promiseId: NodeId, flag: string): string {
        return `promise-${promiseId}-${flag}-test.js`;
    }

    static getTestFilePathForPromise(
        promiseId: NodeId,
        flag: string,
        existingTestFilePath: string,
    ): string {
        const RC = RuntimeConfig.getInstance().config;
        return path.join(
            path.dirname(existingTestFilePath),
            TestGenerator.getTestFileNameForPromise(promiseId, flag),
        );
    }

    public async generateTests(
        prompts: Map<NodeId, Prompts>,
    ): Promise<Map<NodeId, Responses>> {
        const responses: Map<NodeId, Responses> = new Map();

        for (const [promiseId, promisePrompts] of prompts.entries()) {
            const promiseResponses: Responses = {};

            for (const [flag, prompt] of Object.entries(promisePrompts)) {
                if (!prompt.string) continue;

                const response = await this.processPrompt(
                    promiseId,
                    flag,
                    prompt.string,
                    prompt.testPath!,
                );
                if (response) {
                    promiseResponses[flag as PromiseFlagTypes] = response;
                }
            }

            responses.set(promiseId, promiseResponses);
        }

        return responses;
    }

    writePromiseTestToFile(filePath: string, testString: string) {
        fs.writeFileSync(filePath, testString, { flag: 'w' });
        logger.info(`Test written to ${filePath}`);
    }

    deleteTestFile(filePath: string) {
        fs.unlinkSync(filePath);
        logger.info(`Test file deleted at ${filePath}`);
    }

    private async processPrompt(
        promiseId: NodeId,
        flag: string,
        prompt: string,
        existingTestFilePath: string,
        retry: boolean = true,
    ): Promise<string | null> {
        let filePath = TestGenerator.getTestFilePathForPromise(
            promiseId,
            flag,
            existingTestFilePath,
        );

        let messages: LLM.Message[] = [
            { role: LLM.Role.SYSTEM, content: systemPromisePrompt },
            { role: LLM.Role.USER, content: UserMessageComplete },
            { role: LLM.Role.ASSISTANT, content: assistantCorrectResponse },
            { role: LLM.Role.USER, content: prompt },
        ];
        let response = await LLMController.ask(messages);

        try {
            let codeBlock = TestValidator.extractCodeBlock(response);
            if (!codeBlock) {
                return null;
            } else {
                response = codeBlock.code;
            }

            if (TestValidator.validateSyntax(response)) {
                this.writePromiseTestToFile(filePath, response);
                let validRuntime = await TestValidator.validateRuntime(
                    promiseId,
                    flag,
                    filePath,
                );
                if (!validRuntime.success) {
                    logger.error('Runtime error in test.');
                    throw new Error(validRuntime.errorOutput); //FIXME
                }
                return response;
            } else {
                if (retry) {
                    logger.warn('Syntax error in response, retrying...');
                    let newPrompt =
                        'This prompt that I gave you before (separated by $$$) generated a response that had syntactic issues:\n' +
                        '$$$\n' +
                        prompt +
                        '\n$$$\n' +
                        'Now give me a new response that has this issue fixed. Your old response was:\n' +
                        response;
                    return await this.processPrompt(
                        promiseId,
                        flag,
                        newPrompt,
                        filePath,
                        false,
                    );
                } else {
                    logger.error('Syntax error in response, skipping...');
                    return null;
                }
            }
        } catch (error) {
            this.deleteTestFile(filePath);
            if (retry) {
                logger.warn('Runtime error in response, retrying...');
                let newPrompt =
                    'This prompt that I gave you before (separated by $$$) generated a response that had runtime issues:\n' +
                    '$$$\n' +
                    prompt +
                    '\n$$$\n' +
                    'Now give me a new response that has this issue fixed. Your old response was:\n' +
                    response +
                    '\nThe error is:\n' +
                    error;
                return await this.processPrompt(
                    promiseId,
                    flag,
                    newPrompt,
                    filePath,
                    false,
                );
            } else {
                logger.error('Runtime error in response, skipping...');
                return null;
            }
        }
    }
}
