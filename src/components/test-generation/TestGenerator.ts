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
    RC = RuntimeConfig.getInstance().config;

    constructor() {
        dotenv.config()
    }

    async prompt(prompts: Map<NodeId, Prompts>) {
        const gptController = GPTController.getInstance();
        let responses: Map<NodeId, Responses> = new Map();
        for (const [promiseId, promisePrompts] of prompts.entries()) {
            const promiseResponses: Responses = {};
            for (const [flag, prompt] of Object.entries(promisePrompts)) {
                let response = await gptController.ask(prompt.string);
                response = TestValidator.cleanCodeBlocks(response);
                promiseResponses[flag as PromiseFlagTypes] = response;
            }
            responses.set(promiseId, promiseResponses);
        }
        return responses;
    }

    augmentTestSuite(tests: Map<NodeId, Responses>) {
        for (const [promiseId, responses] of tests.entries()) {
            for (const [flag, testString] of Object.entries(responses)) {
                let filePath = path.join(this.RC.projectPath, this.RC.testDirectory, `promise-${promiseId}-${flag}-test.js`);
                fs.writeFileSync(filePath, testString);
            }
        }
    }
}