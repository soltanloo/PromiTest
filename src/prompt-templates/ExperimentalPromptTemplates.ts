export const systemPromisePrompt = `
    You are an expert javascript developer. You have been tasked with writing a test for a promise or asynchronous function that is not sufficiently tested by the current test suite.
    You will receive a prompt including all necessary information to write the test.
    You must
    1: identify and include all necessary imports
    2: identify the test suite and syntax to create the test.
    3: generate a test that covers the missing execution path of the promise or asynchronous function.
    Do not include any additional information in your response.
`;

export const UserMessageComplete = `
line number: 2
promise type: NewPromise
promise status: not Resolved
potential status: Resolvable due to contains a call to resolve() function
test runner used by test suite: mocha
module system used in project: CommonJS
location: index.js
execution path: Location: test/test.js
            
            function (done) {
        foo(false).catch(() => {
            done();
        });
    }
            
            exported: false
            isDefaultExport: false
            
            ---Location: index.js
            
            function foo(condition) {
    return new Promise((resolve, reject) => {
        if (condition) resolve('Hello World!');
        else reject('Rejected');
    });
}
            
            exported: true
            isDefaultExport: false
            exportedAs: foo
            ---
code: function foo(condition) {
    return new Promise((resolve, reject) => {
        if (condition) resolve('Hello World!');
        else reject('Rejected');
    });
} 
Here is the definition of the async function that returns the promise:
`;

export const assistantCorrectResponse = `
const { expect } = require('chai');
const foo = require('../index').foo; // Adjust the path as necessary

describe('foo function', function() {
    it('should resolve with "Hello World!" when condition is true', function(done) {
        foo(true).then(result => {
            expect(result).to.equal('Hello World!');
            done();
        }).catch(done); // Ensure that if it fails, the done callback is called
    });
});
`;

export const UserMessageIncomplete = `
line number: {{relativeLineNumber}}
promise type: {{promiseType}}
promise status: not {{notStatus}}
potential status: {{potentiallyStatus}} due to {{candidacyReason}}
test runner used by test suite: {{testRunner}}
module system used in project: {{moduleSystem}}
location: {{location}}
execution path: {{executionPath}}
code: {{code}} 
{{asyncFunctionDefinition}}
`;
