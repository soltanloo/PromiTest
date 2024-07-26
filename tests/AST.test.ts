import {assert} from "chai";
import {isPromiseCalling} from "../src/utils/AST";

describe('AST', () => {
    describe('isPromiseCalling', () => {
        describe('resolve', () => {
            it('returns true if promise calls resolve()', () => {
                let code = "new Promise((resolve, reject) => {\n" +
                    "\t\tif (condition) resolve(\"Hello World!\");\n" +
                    "\t\telse reject(\"Rejected\");\n" +
                    "\t})"
                assert.isTrue(isPromiseCalling(code, "resolve"))
            })
            it('returns true if promise defers resolve', () => {
                let code = "new Promise((resolve, reject) => {\n\t\tr1 = resolve;\n\t\tr2 = reject;\n\t})"
                assert.isTrue(isPromiseCalling(code, "resolve"))
            })
        })
        describe('reject', () => {
        })
    })
})