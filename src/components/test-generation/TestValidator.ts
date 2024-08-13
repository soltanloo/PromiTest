// @ts-ignore
import { parse } from 'espree';
import { NodeId } from '../../types/Graph.type';
import path from 'path';
import Mocha from 'mocha';
import TestGenerator from './TestGenerator';
import logger from '../../utils/logger';

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
    ): Promise<boolean> {
        const mocha = new Mocha({
            timeout: 10000,
        });
        logger.info(
            `Validating runtime for promise ${promiseId} with flag ${flag}`,
        );
        mocha.addFile(
            path.resolve(
                TestGenerator.getTestFilePathForPromise(promiseId, flag),
            ),
        );
        logger.debug(
            `Added test file to mocha: ${TestGenerator.getTestFilePathForPromise(promiseId, flag)}`,
        );
        try {
            await mocha.loadFilesAsync();

            return new Promise((resolve, reject) => {
                mocha.run((failures) => {
                    if (failures) {
                        logger.error(
                            `Test failed for promise ${promiseId} with flag ${flag}`,
                        );
                        resolve(false);
                    } else {
                        logger.info(
                            `Test passed for promise ${promiseId} with flag ${flag}`,
                        );
                        resolve(true);
                    }
                });
            });
        } catch (error) {
            logger.error(
                `Error running test for promise ${promiseId} with flag ${flag}`,
            );
            throw error;
        }
    }
}
