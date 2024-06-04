import {assert} from "chai";
import {PromiseGraphConstructor} from "../src/components/PromiseGraphConstructor";
import {readJson} from "./common";
import {PromiseCoverageReport} from "../src/types/CoverageAnalyzer.type";
import {CoverageAnalyzer} from "../src/components/CoverageAnalyzer";
import path from "path";
import RuntimeConfig from "../src/components/RuntimeConfig";

export function runUnitTest(testName: string): void {
    describe(testName, () => {
        before(async () => {
            let projectPath = path.resolve(__dirname, `fixtures/${testName}/code`);
            RuntimeConfig.getInstance(projectPath)
        })
        it("should successfully read the raw coverage report", async () => {
            let coverageAnalyzer = new CoverageAnalyzer();
            let coverageReport = await coverageAnalyzer.analyze();
            let expectedCoverageReport = await readJson(`./fixtures/${testName}/expected-jscope-coverage-report.json`);
            assert.deepEqual(coverageReport, expectedCoverageReport);
        });
    })
}

describe("CoverageAnalyzer ", () => {
    describe("unit tests for the case:", () => {
        runUnitTest("new-promise-never-rejected-and-rejectable");
    })
});
