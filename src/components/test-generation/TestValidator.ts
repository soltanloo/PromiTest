// @ts-ignore
import {parse} from 'espree';
import {NodeId} from "../../types/Graph.type";
import path from "path";
import Mocha from 'mocha';
import TestGenerator from "./TestGenerator";

export default class TestValidator {

    static cleanCodeBlocks(text: string): string {
        // Use a regular expression to remove the code block markers
        return text.replace(/```[a-z]*\n/g, '').replace(/```/g, '');
    }

    static validateSyntax(text: string): boolean {
        try {
            parse(text, {ecmaVersion: 2019, sourceType: 'module'});
            return true;
        } catch (e) {
            return false;
        }
    }

    static async validateRuntime(promiseId: NodeId, flag: string): Promise<boolean> {
        const mocha = new Mocha({
            timeout: 10000,
        })

        mocha.addFile(path.resolve(TestGenerator.getTestFilePathForPromise(promiseId, flag)));

        try {
            await mocha.loadFilesAsync();

            return new Promise((resolve, reject) => {
                mocha.run((failures) => {
                    if (failures) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        } catch (error) {
            throw error;
        }


    }
}