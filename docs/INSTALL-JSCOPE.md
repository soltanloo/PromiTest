## JScope Installation Guide

### Prerequisites

- Node.js (v14.0.0 or later recommended)
- npm (v6.0.0 or later)

### Installation

1. Clone `JScope` repository
   ```bash
   git clone https://github.com/SEatSFU/JScope.git
   ```

2. Install `mx`

    1. Clone `mx` repository version 6.1.4
        ```bash
        git clone https://github.com/graalvm/mx.git
        cd mx
        git checkout 6.1.4
        ```

    2. Add the path to `mx` to your `PATH` environment variable

3. Install `JDK 17` via `mx`
    ```bash
    mx -y fetch-jdk --java-distribution labsjdk-ce-17 --to /app --alias labsjdk-ce-17
    ```

4. Set `JDK 17` as your `JAVA_HOME` environment variable
    ```bash
    export JAVA_HOME=/app/labsjdk-ce-17
    ```

5. Install `Nodeprof.js`
    ```bash
    git clone https://github.com/MohGanji/nodeprof.js.git
    cd nodeprof.js
    git checkout 138a684
    mx sforceimports
    mx build
    ```

6. Build `JScope`
    ```bash
    npm run build
    ```