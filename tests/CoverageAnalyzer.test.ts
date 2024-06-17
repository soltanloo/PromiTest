import {assert} from "chai";
import {readJson} from "./common";
import {CoverageAnalyzer} from "../src/components/coverage-analysis/CoverageAnalyzer";
import path from "path";
import RuntimeConfig from "../src/components/configuration/RuntimeConfig";
import dotenv from "dotenv";

dotenv.config();


export function runUnitTest(testName: string): void {
    describe(testName, function () {
        this.timeout(1000000);
        before(async function () {
            let projectPath = path.resolve(__dirname, `fixtures/code/${testName}`);
            RuntimeConfig.getInstance(projectPath)
        })
        it("should successfully read the raw coverage report", async function () {
            let coverageAnalyzer = new CoverageAnalyzer();
            let coverageReport = await coverageAnalyzer.readReport();
            let expectedCoverageReport = await readJson(`./fixtures/expected-outputs/${testName}/expected-jscope-coverage-report.json`);
            assert.deepEqual(coverageReport, expectedCoverageReport);
        });
        it("should successfully refine the raw coverage report", async function () {
            let coverageAnalyzer = new CoverageAnalyzer();
            let coverageReport = await coverageAnalyzer.analyze();
            let expectedCoverageReport = await readJson(`./fixtures/expected-outputs/${testName}/expected-refined-coverage-report.json`);
            assert.deepEqual(coverageReport, expectedCoverageReport);
        });
    })
}

describe("CoverageAnalyzer ", function () {
    describe("unit tests for the case:", function () {
        runUnitTest("new-promise/nested-never-rejected-and-rejectable");
    })
});
