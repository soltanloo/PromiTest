// @ts-ignore
import { parse } from 'espree';
import { NodeId } from '../../types/Graph.type';
import path from 'path';
import Mocha from 'mocha';
// import * as tap from 'tap';
import TestGenerator from './TestGenerator';
import logger from '../../utils/logger';
import RuntimeConfig from '../configuration/RuntimeConfig';

interface ValidationResult {
    success: boolean;
    errorOutput?: string;
}

export default class TestValidator {
    static cleanCodeBlocks(text: string): string {
        // Use a regular expression to remove the code block markers
        return text.replace(/```[a-z]*\n/g, '').replace(/```/g, '');
    }

    static validateSyntax(text: string): boolean {
        try {
            parse(text, { ecmaVersion: 2019, sourceType: 'module' });
            logger.debug('Syntax validation passed');
            return true;
        } catch (e) {
            logger.debug('Syntax validation failed');
            return false;
        }
    }

    static async validateRuntime(
        promiseId: NodeId,
        flag: string,
        filePath: string,
    ): Promise<ValidationResult> {
        const testFilePath = filePath;

        logger.info(
            `Validating runtime for promise ${promiseId} with flag ${flag}`,
        );
        logger.debug(`Added test file: ${testFilePath}`);

        try {
            // Determine the type of test (Mocha or TAP)
            const isTapTest = TestValidator.isTapTestFile();

            if (isTapTest) {
                // Run TAP test
                // return await TestValidator.runTapTest(testFilePath, promiseId, flag);
                return Promise.resolve({ success: true });
            } else {
                // Run Mocha test
                return await TestValidator.runMochaTest(
                    testFilePath,
                    promiseId,
                    flag,
                );
            }
        } catch (error: any) {
            logger.error(
                `Error running test for promise ${promiseId} with flag ${flag}`,
            );
            logger.error(error);
            return {
                success: false,
                errorOutput: error.message || String(error),
            };
        }
    }

    static async runMochaTest(
        testFilePath: string,
        promiseId: NodeId,
        flag: string,
    ): Promise<ValidationResult> {
        const mocha = new Mocha({
            timeout: 10000,
        });
        mocha.addFile(testFilePath);

        try {
            mocha.addFile(testFilePath);

            await mocha.loadFilesAsync();
        } catch (error: any) {
            logger.error(`Error loading test files: ${error.message || error}`);
            return {
                success: false,
                errorOutput: `Error loading test files: ${error.message || String(error)}`,
            };
        }

        return new Promise((resolve) => {
            const runner = mocha.run();

            let hasRuntimeError = false;
            let errorOutput = '';

            runner.on('fail', (test, err) => {
                if (
                    err.name === 'AssertionError' ||
                    err.code === 'ERR_ASSERTION'
                ) {
                    // Assertion failure
                    logger.warn(
                        `Assertion failed in test: ${test.fullTitle()}`,
                    );
                    logger.warn(err.message);
                } else {
                    // Runtime error
                    hasRuntimeError = true;
                    errorOutput += `Runtime error in test '${test.fullTitle()}': ${err.message}\n`;
                    logger.error(`Runtime error in test: ${test.fullTitle()}`);
                    logger.error(err);
                }
            });

            runner.on('end', () => {
                if (hasRuntimeError) {
                    logger.error(
                        `Test failed with runtime error for promise ${promiseId} with flag ${flag}`,
                    );
                    resolve({ success: false, errorOutput });
                } else if (runner.failures) {
                    logger.info(
                        `Test completed with assertion failures for promise ${promiseId} with flag ${flag}`,
                    );
                    resolve({ success: true }); // Decide if assertion failures should resolve to true or false
                } else {
                    logger.info(
                        `Test passed for promise ${promiseId} with flag ${flag}`,
                    );
                    resolve({ success: true });
                }
            });

            runner.on('uncaughtException', (err) => {
                hasRuntimeError = true;
                errorOutput += `Uncaught exception: ${err.message}\n`;
                logger.error('Uncaught exception:', err);
            });
        });
    }

    // static async runTapTest(
    //     testFilePath: string,
    //     promiseId: NodeId,
    //     flag: string,
    // ): Promise<boolean> {
    //     return new Promise((resolve, reject) => {
    //         let hasRuntimeError = false;
    //         let hasFailures = false;
    //
    //         tap.test('Running TAP test', (t) => {
    //             t.teardown(() => {
    //                 if (hasRuntimeError) {
    //                     logger.error(
    //                         `Test failed with runtime error for promise ${promiseId} with flag ${flag}`,
    //                     );
    //                     resolve(false);
    //                 } else if (hasFailures) {
    //                     logger.info(
    //                         `Test completed with assertion failures for promise ${promiseId} with flag ${flag}`,
    //                     );
    //                     resolve(true); // Proceed despite assertion failures if desired
    //                 } else {
    //                     logger.info(
    //                         `Test passed for promise ${promiseId} with flag ${flag}`,
    //                     );
    //                     resolve(true);
    //                 }
    //             });
    //
    //             t.on('fail', (data: any) => {
    //                 if (data.diag && data.diag.name === 'AssertionError') {
    //                     // Assertion failure
    //                     hasFailures = true;
    //                     logger.warn(`Assertion failed in test: ${data.name}`);
    //                     logger.warn(data.diag.message);
    //                 } else {
    //                     // Runtime error
    //                     hasRuntimeError = true;
    //                     logger.error(`Runtime error in test: ${data.name}`);
    //                     logger.error(data.diag);
    //                 }
    //             });
    //
    //             t.on('error', (err) => {
    //                 hasRuntimeError = true;
    //                 logger.error('Runtime error:', err);
    //             });
    //
    //             // Load and execute the TAP test file
    //             require(testFilePath);
    //         }).catch((err) => {
    //             hasRuntimeError = true;
    //             logger.error('Failed to run TAP test:', err);
    //             resolve(false);
    //         });
    //     });
    // }

    static isTapTestFile(): boolean {
        return RuntimeConfig.getInstance().config.testRunner === 'tap';
    }
}
