import {assert} from "chai";
import {CoverageAnalyzer} from "../src/components/CoverageAnalyzer";

describe("CoverageAnalyzer ", () => {
    let coverageAnalyzer: CoverageAnalyzer;
    before(() => {
        coverageAnalyzer = new CoverageAnalyzer('sample', '' /* FIXME later */);
    })
    it("should successfully read the sample coverage report", async () => {
        let coverageReport = await coverageAnalyzer.analyze();
        assert.deepEqual(coverageReport, [
            {
                identifier: 116,
                location: 'path/to/file.js:12:5:17:20',
                type: 'NewPromise',
                warnings: {rejection: true},
                code: "new Promise((resolve, reject) => {\n                    if (num > 10) {\n                        resolve(\"The number is greater than 10!\");\n                    } else {\n                        reject(\"The number is not greater than 10.\");\n                    }\n                });"
            }
        ]);
    })
});
