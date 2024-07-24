import TestValidator from "../src/components/test-generation/TestValidator";
import {assert} from "chai";

describe("TestValidator ", function () {
    describe("validateSyntax", function () {
        it("Should return false if input code is not syntactically correct", function () {
            let code = "function test() {";
            let hasValidSyntax = TestValidator.validateSyntax(code);
            assert.isFalse(hasValidSyntax);
        })
    })
});
