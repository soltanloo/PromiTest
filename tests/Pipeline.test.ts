import {runUnitTest as runPromptGeneratorUnitTest} from "./PromptGenerator.test";
import {runUnitTest as runCallgraphGeneratorUnitTest} from "./CallgraphGenerator.test";
import {runUnitTest as runCoverageAnalyzerUnitTest} from "./CoverageAnalyzer.test";
import {runUnitTest as runPromiseGraphConstructorUnitTest} from "./PromiseGraphConstructor.test";
import {runUnitTest as runPromiseGraphTestabilityMarkerUnitTest} from "./PromiseGraphTestabilityMarker.test";

function runUnitTest(testName: string): void {
    describe(testName, function () {
        runCoverageAnalyzerUnitTest(testName)
        runPromiseGraphConstructorUnitTest(testName)
        runPromiseGraphTestabilityMarkerUnitTest(testName)
        runCallgraphGeneratorUnitTest(testName)
        runPromptGeneratorUnitTest(testName)
    })
}

describe("Pipeline", function () {
    describe("unit tests for the case", function () {
        runUnitTest("new-promise/nested-never-rejected-and-rejectable");
    })
});
