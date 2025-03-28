export const rootNodePromptTemplate = `In the statement: '{{statement}}' At line {{relativeLineNumber}} there is a promise of type '{{promiseType}}', which is not {{notStatus}} by the current test suite.
It's potentially {{potentiallyStatus}} because {{candidacyReason}}.
If possible, generate a test that can cover this execution path of the promise.
Only include the new test code in your response; no description or anything.
Make sure to include the imports as well. I want the test to be runnable in a separate file.
The current test suite uses {{testRunner}}.
The module system used in the project is: {{moduleSystem}}.

Location: {{location}}
{{code}}

{{asyncFunctionDefinition}}

The execution path from the test to the mentioned function is included for you to better understand the context.
Each function is separated by ---, and the location of each one is provided.
Also, I have included export info about them, so that you can correctly write the imports and also possibly directly use them in the new test and avoid taking the whole execution path:

{{executionPath}}`;
