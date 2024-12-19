export const systemPromisePrompt = `
    You are an expert javascript developer. You have been tasked with writing a test for a promise or asynchronous function that is not sufficiently tested by the current test suite.
    You will receive a prompt including all necessary information to write the test.
    You must
    1: identify and include all necessary imports and hooks based on the test suite given to you
    2: identify the test suite and syntax to create the test.
    3: generate a test that covers the missing execution path of the promise or asynchronous function.
    Do not include any additional information in your response.
    Things to consider:
    1. Your response should be runnable as a standalone file, i.e it should contain all the imports/hooks I give you in the current test suite.
    2. All code blocks given to you are surrounded by triple backticks.
    3. You can mock only if the promise statement is a call to a library function, or if the test suite already uses mocking. Also, don't add a mocking library if it's not already imported in the test suite.
`;

export const UserMessageComplete = `
promise type: NewPromise
location: index.js
code containing the promise: 
\`\`\`
async (dirname, options = {}) => {
  if (options.dryRun !== true) {
    return new Promise((resolve, reject) => {
      rimraf(dirname, { ...options, glob: false }, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    })
  }
}
\`\`\`
statement returning the promise:
\`\`\`
new Promise((resolve, reject) => {
      rimraf(dirname, { ...options, glob: false }, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    })
\`\`\`
line number of the promise statement in the container code: 3
promise status: not Rejected
potential status: Resolvable due to contains a call to reject() function or a throw keyword
test runner used by test suite: mocha
module system used in project: CommonJS
test and the execution path leading the the execution of the promise:
test:
\`\`\`
'use strict';
const fs = require('fs');
const path = require('path');
const util = require('util');
const readdir = require('@folder/readdir');
const assert = require('assert');
const rimraf = require('rimraf');
const deleteEmpty = require('..');
const copy = require('./support/copy');
const fixtures = path.join.bind(path, __dirname, 'fixtures');
const expected = [
    fixtures('temp/a/aa/aaa'),
    fixtures('temp/a/aa/aaa/aaaa'),
    fixtures('temp/b'),
    fixtures('temp/c')
];
const noNested = files => files.filter(file => !/nested/.test(file));
const filter = file => file.isDirectory();
let folders;
describe('deleteEmpty', () => {
    afterEach(cb => rimraf(fixtures('temp'), cb));
    beforeEach(async () => {
        await copy(fixtures('paths'), fixtures('temp'));
        folders = readdir.sync(fixtures('temp/nested'), {
            filter,
            recursive: true,
            absolute: true
        });
        folders.sort();
    });
    describe('promise', cb => {
        it('should delete the given cwd if empty', () => {
            return deleteEmpty(fixtures('temp/b')).then(deleted => {
                assert(!fs.existsSync(fixtures('temp/b')));
            });
        });
    });
});
\`\`\`
execution path:
Location: index.js
            \`\`\`
            async filepath => {
    let dir = path.resolve(filepath);

    if (!isValidDir(cwd, dir, empty)) return;
    onDirectory(dir);

    let files = await /*(() => { throw new Error("Mock Rejection") })()*/ readdir(dir);

    if (isEmpty(dir, files, empty, opts)) {
      empty.push(dir);

      await deleteDir(dir, opts);

      if (opts.verbose === true) {
        console.log(colors.red('Deleted:'), path.relative(cwd, dir));
      }

      if (typeof opts.onDelete === 'function') {
        await opts.onDelete(dir);
      }

      return remove(path.dirname(dir));
    }

    for (const file of files) {
      await remove(path.join(dir, file));
    }

    return empty;
  }
            \`\`\`
            exported: false
            isDefaultExport: false
            
            ---Location: index.js
            \`\`\`
            async (dirname, options = {}) => {
  if (options.dryRun !== true) {
    return new Promise((resolve, reject) => {
      rimraf(dirname, { ...options, glob: false }, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    })
  }
}
            \`\`\`
            exported: false
            isDefaultExport: false
            
            ---
`;

export const assistantCorrectResponse = `
'use strict';

require('mocha');
const fs = require('fs');
const path = require('path');
const util = require('util');
const readdir = require('@folder/readdir');
const assert = require('assert');
const rimraf = require('rimraf');
const deleteEmpty = require('..');
const copy = require('./support/copy');

const fixtures = path.join.bind(path, __dirname, 'fixtures');
const expected = [
  fixtures('temp/a/aa/aaa'),
  fixtures('temp/a/aa/aaa/aaaa'),
  fixtures('temp/b'),
  fixtures('temp/c')
];

const noNested = files => files.filter(file => !/nested/.test(file));
const filter = file => file.isDirectory();
let folders;


describe('deleteEmpty', () => {
  afterEach(cb => {
    // Restore permissions and clean up
    fs.chmodSync(fixtures('temp/protected_dir'), 0o755);
    rimraf(fixtures('temp'), cb);
  });

  beforeEach(async () => {
    await copy(fixtures('paths'), fixtures('temp'));
    folders = readdir.sync(fixtures('temp/nested'), { filter, recursive: true, absolute: true });
    folders.sort();

    // Create a directory and remove its read permissions
    const protectedDir = fixtures('temp/protected_dir');
    fs.mkdirSync(protectedDir);
    fs.chmodSync(protectedDir, 0o000); // No permissions
  });

  it('should throw an error if readdir encounters a permission error', async () => {
    try {
      // Attempt to delete the directory with restricted permissions
      await deleteEmpty(fixtures('temp/protected_dir'));
      throw new Error('Expected deleteEmpty to throw an error');
    } catch (err) {
      assert.strictEqual(err.code, 'EACCES'); // EACCES: Error code for "permission denied"
    }
  });
});

`;

export const UserMessageIncomplete = `
promise type: {{promiseType}}
location: {{location}}
code containing the promise: 
\`\`\`
{{code}} 
\`\`\`
statement returning the promise:
\`\`\`
{{statement}}
\`\`\`
line number of the promise statement in the container code: {{relativeLineNumber}}
{{asyncFunctionDefinition}}
promise status: not {{notStatus}}
potential status: {{potentiallyStatus}} because {{candidacyReason}}
test runner used by test suite: {{testRunner}}
module system used in project: {{moduleSystem}}
test and the execution path leading the the execution of the promise:
test:
\`\`\`
{{testMetaData}}
\`\`\`
execution path:
{{executionPath}}
`;
