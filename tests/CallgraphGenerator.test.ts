import {assert} from "chai";
import {readJson} from "./common";
import RuntimeConfig from "../src/components/RuntimeConfig";
import path from 'path';
import CallgraphGenerator from "../src/components/CallgraphGenerator";

function runUnitTest(testName: string): void {
    describe(testName, () => {
        before(async () => {
            let projectPath = path.resolve(__dirname, `fixtures/${testName}/code`);
            RuntimeConfig.getInstance(projectPath)
        })
        it("callgraph should be correctly generated", async () => {
            let callgraphGenerator = new CallgraphGenerator();
            let expectedCallgraph = await readJson(`./fixtures/${testName}/expected-callgraph.json`);
            let actualCallgraph = callgraphGenerator.callgraph.getNodesAsObject();
            assert.deepEqual(actualCallgraph, expectedCallgraph);
        });
    })
}

describe("CallgraphGenerator ", () => {
    describe("unit tests", () => {
        runUnitTest("new-promise-never-rejected-and-rejectable");
    })
});
