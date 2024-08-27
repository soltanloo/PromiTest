export const systemPromisePrompt = 
`
    You are an expert javascript developer. You have been tasked with writing a test for a promise or asynchronous function that is not sufficiently tested by the current test suite.
    You will receive a prompt including all necessary information to write the test.
    You must
    1: identify and include all necessary imports
    2: identify the test suite and syntax to create the test.
    3: generate a test that covers the missing execution path of the promise or asynchronous function.
    Do not include any additional information in your response.
`


export const UserMessageComplete =
`
line number: {{line}}
promise type: {{promiseType}}
promise status: not {{notStatus}}
potential status: {{potentiallyStatus}} because {{candidacyReason}}
test runner used by test suite: {{testRunner}}
module system used in project: {{moduleSystem}}
location: {{location}}
execution path: {{executionPath}}
code: {{code}} 
{{asyncFunctionDefinition}}
`;

export const assistantCorrectResponse =
`

`

export const UserMessageIncomplete =
`
line number: {{line}}
promise type: {{promiseType}}
promise status: not {{notStatus}}
potential status: {{potentiallyStatus}} due to {{candidacyReason}}
test runner used by test suite: {{testRunner}}
module system used in project: {{moduleSystem}}
location: {{location}}
execution path: {{executionPath}}
code: {{code}} 
{{asyncFunctionDefinition}}
`