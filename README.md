This project aims to enhance the asynchronous coverage of JavaScript programs by automatically generating tests for
uncovered `Promise`s.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (v14.0.0 or later recommended)
- npm (v6.0.0 or later)

### Installation

1. Clone the repository to your local machine:

```bash
git clone git@github.com:SEatSFU/PromiTest.git
cd PromiTest
```

2. Install the necessary dependencies:

```bash
npm install
```

3. Obtain an [OpenAI API Key](https://openai.com/blog/openai-api) and set the `OPENAI_API_KEY` environment variable
   accordingly by creating a `.evn` file in the root folder of the project.

### Usage

1. **Running the Tests**

    ```bash
    npm test
    ```
