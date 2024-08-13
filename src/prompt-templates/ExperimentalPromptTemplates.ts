export const CondensedPromptTemplate = `Promise type: "{{promiseType}}" is not {{notStatus}} by the current test suite.
It’s potentially {{potentiallyStatus}} due to {{candidacyReason}}.
Generate a test for this promise execution path.
Include only the new test code with imports; no description or comments.
Ensure the test is runnable in a separate file using {{testRunner}}.

Location: {{location}}
{{code}}

Execution path for context:
Functions separated by "---" with locations provided. Export status is mentioned for direct use in the new test:

{{executionPath}}`;

export const YouAreApproachPromptTemplate = `You are a software testing engineer. 
There is a Promise of type "{{promiseType}}" 
that is not {{notStatus}} by the current test suite 
and is potentially {{potentiallyStatus}} due to {{candidacyReason}}.
Create a test for this promise execution path using {{testRunner}}. 
Include only the test code with imports, no description or comments.
Use the following execution path for context:
Functions are separated by "---" with locations provided. 
Export status is noted for direct use in the test.

Execution Path: {{executionPath}}

Location: {{location}}
{{code}}`;

export const RewordedCondensedTemplate = `
Location: {{location}}
{{code}}

Promise type "{{promiseType}}" is {{notStatus}} by the current test suite.
It's potentially {{potentiallyStatus}} due to {{candidacyReason}}.
Please generate a runnable test for this execution path using {{testRunner}}.
Include only the test code with necessary imports; no additional description.

Execution path context:
Functions are separated by "---" with locations provided. Export status is mentioned for direct use in the new test:

{{executionPath}}`;
