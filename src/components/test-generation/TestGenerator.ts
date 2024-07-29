import {NodeId} from "../../types/Graph.type";
import {GPTController} from "../apis/GPTController";
import dotenv from "dotenv";
import RuntimeConfig from "../configuration/RuntimeConfig";
import TestValidator from "./TestValidator";

import {Prompts, Responses} from "../../types/Prompt.type";
import {PromiseFlagTypes} from "../../types/PromiseGraph.type";
import * as fs from "node:fs";
import path from "path";

export default class TestGenerator {
    private gptController = GPTController.getInstance();


    constructor() {
        dotenv.config()
    }

    static getTestFileNameForPromise(promiseId: NodeId, flag: string): string {
        return `promise-${promiseId}-${flag}-test.js`;
    }

    static getTestFilePathForPromise(promiseId: NodeId, flag: string): string {
        const RC = RuntimeConfig.getInstance().config;
        return path.join(RC.projectPath, RC.testDirectory, TestGenerator.getTestFileNameForPromise(promiseId, flag));
    }

    public async generateTests(prompts: Map<NodeId, Prompts>): Promise<Map<NodeId, Responses>> {
        const responses: Map<NodeId, Responses> = new Map();

        for (const [promiseId, promisePrompts] of prompts.entries()) {
            const promiseResponses: Responses = {};

            for (const [flag, prompt] of Object.entries(promisePrompts)) {
                const response = await this.processPrompt(promiseId, flag, prompt.string);
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

    writePromiseTestToFile(promiseId: NodeId, flag: string, testString: string) {
        let filePath = TestGenerator.getTestFilePathForPromise(promiseId, flag);
        fs.writeFileSync(filePath, testString);
    }

    deleteTestFile(promiseId: NodeId, flag: string) {
        let filePath = TestGenerator.getTestFilePathForPromise(promiseId, flag);
        fs.unlinkSync(filePath);
    }

    private async processPrompt(promiseId: NodeId, flag: string, prompt: string, retry: boolean = true): Promise<string | null> {
        let response = await this.gptController.ask(prompt);

        try {
            response = TestValidator.cleanCodeBlocks(response);

            if (TestValidator.validateSyntax(response)) {
                this.writePromiseTestToFile(promiseId, flag, response);
                let validRuntime = await TestValidator.validateRuntime(promiseId, flag);
                if (!validRuntime) {
                    throw new Error("Test failed.") //FIXME
                }
                return response;
            } else {
                console.log("Syntax error", response);
                if (retry) {
                    let newPrompt = "This prompt that I gave you before (separated by $$$) generated a response that had syntactic issues:\n" +
                        "$$$\n" + prompt + "\n$$$\n" +
                        "Now give me a new response that has this issue fixed. Your old response was:\n" +
                        response;
                    return await this.processPrompt(promiseId, flag, newPrompt, false);
                } else {
                    return null;
                }
            }
        } catch (error) {
            console.error("Error processing prompt", error);
            this.deleteTestFile(promiseId, flag);
            if (retry) {
                let newPrompt = "This prompt that I gave you before (separated by $$$) generated a response that had runtime issues:\n" +
                    "$$$\n" + prompt + "\n$$$\n" +
                    "Now give me a new response that has this issue fixed. Your old response was:\n" +
                    response + "\nThe error is:\n" + error;
                return await this.processPrompt(promiseId, flag, newPrompt, false);
            } else {
                return null;
            }
        }
    }


}