This project aims to enhance the asynchronous coverage of JavaScript programs by automatically generating tests for
uncovered `Promise`s.

# Getting Started

## Prerequisites

Ensure you have the following installed:

- [Modified JScope](https://anonymous.4open.science/r/JScope-414C) ([Installation Guide](./docs/INSTALL-JSCOPE.md))
- Node.js (v14.0.0 or later recommended)
- npm (v6.0.0 or later)

## Installation

1. Clone the repository to your local machine:

    ```bash
    git clone https://anonymous.4open.science/r/PromiTest
    cd PromiTest
    ```

2. Install the necessary dependencies:

    ```bash
    npm install
    ```

3. Set up the environment variables inside a file called `.env` in the root folder of the
   project. ([Sample](.env.sample))

    1. Obtain an [OpenAI API Key](https://openai.com/blog/openai-api) and set the `OPENAI_API_KEY` environment variable
       accordingly.
    2. Set the `JSCOPE_PATH` environment variable to refer to JScope's cli runner.

4. Build the project:
    ```bash
    npm run build
    ```

## Testing

### Running the Tests

To run the tests, use the following command:

```bash
npm test
```

### Adding New Tests

The tests are located inside [tests](tests) directory. The structure of the directory is as follows:

```text
tests
|__ fixtures
    |__ code
    |__ expected-outputs
```

- The [code](tests/fixtures/code) directory hosts the source codes of different test cases, each relating to a certain
  scenario, grouped by type.
- The [expected-outputs](tests/fixtures/expected-outputs) directory hosts the expected outputs of each module for
  different test cases, each relating to a certain scenario, grouped by type.
- After adding the source code and the expected outputs of a new scenario, you should add a new line to
  the [Test Pipeline](tests/Pipeline.test.ts), calling the `runUnitTest` function with the title of the scenario. The
  title should be formatted like this: `<group>/<scenario-title>`
- **NOTE:** The source code folder of a scenario must include the two configuration files described
  in [this section](#configuration).

## Usage

### Configuration

Before running the tool, you need to make sure that both of the following configuration files are included in root
folder of the project under test:

- `promitest.config.json`
  ```json
  {
      "testDirectory": "path/to/tests",
      "testRunner": "mocha|tap"
  }
  ```
- `jscope.json`
  ```json
  {
      "test_framework": "mocha|tap",
      "test_subdir": "path/to/tests",
      "test_regex": "*-test.js"
  }
  ```

### Running the Tool

```shell
node ./dist/src/cli.js generate /path/to/project
```
