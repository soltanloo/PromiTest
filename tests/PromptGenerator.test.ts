import {PromiseGraphConstructor} from "../src/components/PromiseGraphConstructor";
import {readJson} from "./common";
import {PromiseCoverageReport} from "../src/types/CoverageAnalyzer.type";
import {PromiseGraphTestabilityMarker} from "../src/components/PromiseGraphTestabilityMarker";
import {PromptGenerator} from "../src/components/PromptGenerator";
import path from "path";
import RuntimeConfig from "../src/components/RuntimeConfig";
import CallgraphGenerator from "../src/components/CallgraphGenerator";
import {assert} from "chai";

export function runUnitTest(testName: string): void {
    describe(testName, () => {
        before(async () => {
            let projectPath = path.resolve(__dirname, `fixtures/${testName}/code`);
            RuntimeConfig.getInstance(projectPath)
        })

        it("prompts should be correctly generated", async () => {
            let expectedRefinedCoverageReport = await readJson(`./fixtures/${testName}/expected-refined-coverage-report.json`) as PromiseCoverageReport;
            let promiseGraphConstructor = new PromiseGraphConstructor(expectedRefinedCoverageReport);
            promiseGraphConstructor.constructGraph();

            let promiseGraphTestabilityMarker = new PromiseGraphTestabilityMarker();
            promiseGraphTestabilityMarker.markGraph(promiseGraphConstructor.promiseGraph);

            let callgraphGenerator = new CallgraphGenerator();

            let promptGenerator = new PromptGenerator(callgraphGenerator.callgraph);
            promptGenerator.generatePrompts(promiseGraphConstructor.promiseGraph);

            let expectedPrompts = await readJson(`./fixtures/${testName}/expected-prompts.json`);
            // let actualPrompts =
            // assert.deepEqual(actualPrompts, expectedPrompts);
        });
    })
}

describe("PromptGenerator ", () => {
    describe("unit tests", () => {
        runUnitTest("new-promise-never-rejected-and-rejectable");
    })
});
