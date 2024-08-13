import { assert } from 'chai';
import { detectExports, isPromiseCalling } from '../src/utils/AST';
// @ts-ignore
import { parse } from 'espree';

describe('AST', function () {
    describe('isPromiseCalling', function () {
        describe('resolve', function () {
            it('returns true if promise calls resolve()', function () {
                let code =
                    'new Promise((resolve, reject) => {\n' +
                    '\t\tif (condition) resolve("Hello World!");\n' +
                    '\t\telse reject("Rejected");\n' +
                    '\t})';
                assert.isTrue(isPromiseCalling(code, 'resolve'));
            });
            it('returns true if promise defers resolve', function () {
                let code =
                    'new Promise((resolve, reject) => {\n\t\tr1 = resolve;\n\t\tr2 = reject;\n\t})';
                assert.isTrue(isPromiseCalling(code, 'resolve'));
            });
        });
        describe('reject', function () {});
    });

    describe('detectExports', function () {
        it('correctly identifies exports', function () {
            let code =
                'export function foo() {}\n' +
                'function bar() {}\n' +
                'export { bar as baz };\n' +
                'export default function qux() {}\n' +
                'module.exports = { alpha, beta: gamma };\n' +
                'exports.delta = deltaFn;';
            let ast = parse(code, { ecmaVersion: 2019, sourceType: 'module' });
            let exportInfo = detectExports(ast);
            console.log(exportInfo);
        });
    });
});
