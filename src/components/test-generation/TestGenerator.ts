import { NodeId } from '../../types/Graph.type';
import { GPTController } from '../apis/GPTController';
import dotenv from 'dotenv';
import RuntimeConfig from '../configuration/RuntimeConfig';
import TestValidator from './TestValidator';

import { Prompts, Responses } from '../../types/Prompt.type';
import { PromiseFlagTypes } from '../../types/PromiseGraph.type';
import * as fs from 'node:fs';
import path from 'path';
import logger from '../../utils/logger';
import { GPT } from '../../types/GPT.type';
import {
    assistantCorrectResponse,
    systemPromisePrompt,
    UserMessageComplete,
} from '../../prompt-templates/ExperimentalPromptTemplates';

export default class TestGenerator {
    private gptController = GPTController.getInstance();

    constructor() {
        dotenv.config();
    }

    static getTestFileNameForPromise(promiseId: NodeId, flag: string): string {
        return `promise-${promiseId}-${flag}-test.js`;
    }

    static getTestFilePathForPromise(promiseId: NodeId, flag: string): string {
        const RC = RuntimeConfig.getInstance().config;
        return path.join(
            RC.projectPath,
            RC.testDirectory,
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
                const response = await this.processPrompt(
                    promiseId,
                    flag,
                    prompt.string,
                );
                if (response) {
                    promiseResponses[flag as PromiseFlagTypes] = response;
                }
            }

            responses.set(promiseId, promiseResponses);
        }

        return responses;
    }

    augmentTestSuite(tests: Map<NodeId, Responses>) {
        for (const [promiseId, responses] of tests.entries()) {
            this.writePromiseTestsToFile(promiseId, responses);
        }
    }

    writePromiseTestsToFile(promiseId: NodeId, tests: Responses) {
        for (const [flag, testString] of Object.entries(tests)) {
            this.writePromiseTestToFile(promiseId, flag, testString);
        }
    }

    writePromiseTestToFile(
        promiseId: NodeId,
        flag: string,
        testString: string,
    ) {
        logger.debug(`Writing test for promise ${promiseId} with flag ${flag}`);
        let filePath = TestGenerator.getTestFilePathForPromise(promiseId, flag);
        fs.writeFileSync(filePath, testString);
        logger.info(`Test written to ${filePath}`);
    }

    deleteTestFile(promiseId: NodeId, flag: string) {
        logger.debug(
            `Deleting test file for promise ${promiseId} with flag ${flag}`,
        );
        let filePath = TestGenerator.getTestFilePathForPromise(promiseId, flag);
        fs.unlinkSync(filePath);
        logger.info(`Test file deleted at ${filePath}`);
    }

    private async processPrompt(
        promiseId: NodeId,
        flag: string,
        prompt: string,
        retry: boolean = true,
    ): Promise<string | null> {
        let messages: GPT.Message[] = [
            { role: GPT.Role.SYSTEM, content: systemPromisePrompt },
            { role: GPT.Role.USER, content: UserMessageComplete },
            { role: GPT.Role.ASSISTANT, content: assistantCorrectResponse },
            { role: GPT.Role.USER, content: prompt },
        ];
        let response = await this.gptController.ask(messages);

        try {
            response = TestValidator.cleanCodeBlocks(response);

            if (TestValidator.validateSyntax(response)) {
                this.writePromiseTestToFile(promiseId, flag, response);
                let validRuntime = await TestValidator.validateRuntime(
                    promiseId,
                    flag,
                );
                if (!validRuntime) {
                    logger.error('Test failed.');
                    throw new Error('Test failed.'); //FIXME
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
                        false,
                    );
                } else {
                    logger.error('Syntax error in response, skipping...');
                    return null;
                }
            }
        } catch (error) {
            this.deleteTestFile(promiseId, flag);
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
                    false,
                );
            } else {
                logger.error('Runtime error in response, skipping...');
                return null;
            }
        }
    }
}
