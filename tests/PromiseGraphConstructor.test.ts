import {assert, expect} from "chai";
import {PromiseGraphConstructor} from "../src/components/PromiseGraphConstructor";

describe("PromiseGraphConstructor ", () => {
    let promiseGraphConstructor: PromiseGraphConstructor;
    it("should successfully create a graph of a single promise", async () => {
        let promiseIdentifier = 116;
        promiseGraphConstructor = new PromiseGraphConstructor([
            {
                identifier: promiseIdentifier,
                location: 'path/to/file.js:12:5:17:20',
                type: 'NewPromise',
                warnings: {rejection: true},
                code: "new Promise((resolve, reject) => {\n                    if (num > 10) {\n                        resolve(\"The number is greater than 10!\");\n                    } else {\n                        reject(\"The number is not greater than 10.\");\n                    }\n                });"
            }
        ]);
        promiseGraphConstructor.constructGraph();
        let {adjacencyMap} = promiseGraphConstructor.promiseGraph
        assert.isTrue(adjacencyMap.has(promiseIdentifier))
        assert.isEmpty(adjacencyMap.get(promiseIdentifier))
        assert.equal(adjacencyMap.size, 1)
    })
});
