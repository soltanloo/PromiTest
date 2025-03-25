import { Prompt } from './Prompt';
import { PromiseNode } from '../promise-graph/PromiseNode';
import { Node } from '../../types/Graph.type';
import { detectModuleSystem } from '../../utils/AST';
import path from 'path';
import RuntimeConfig from '../configuration/RuntimeConfig';
import { UserMessageIncomplete } from '../../prompt-templates/ExperimentalPromptTemplates';
import { FunctionDefinition } from '../../types/Callgraph.type';
import { PromiseFlagTypes } from '../../types/PromiseGraph.type';

export class RootNodePrompt extends Prompt {
    executionPathString: string;
    testMetaData: string;

    constructor(
        promiseNode: PromiseNode,
        executionPath: FunctionDefinition[],
        testPath: string,
        testMetaData: string,
        flag: PromiseFlagTypes,
    ) {
        super(promiseNode);
        this.flag = flag;
        this.testPath = testPath;
        this.testMetaData = testMetaData;
        this.executionPathString = this.executionPathToString(executionPath);
        this.string = this.getPromptText();
    }

    executionPathToString(executionPath: FunctionDefinition[]): string {
        let executionPathString = '';
        for (const func of executionPath) {
            executionPathString += `--------
            Location: ${func.file}
            \`\`\`
            ${func.sourceCode}
            \`\`\`
            exported: ${func.exportInfo.exported}
            isDefaultExport: ${func.exportInfo.defaultExport}
            ${func.exportInfo.exportedAs ? 'exportedAs: ' + func.exportInfo.exportedAs : ''}
            --------`;
        }
        return executionPathString;
    }

    getPromptText(): string {
        const placeholders = {
            promiseType: this.promiseNode.promiseInfo.type,
            notStatus: this.flag === 'rejectable' ? 'Rejected' : 'Resolved',
            potentiallyStatus:
                this.flag === 'rejectable' ? 'Rejectable' : 'Resolvable',
            candidacyReason: this.candidacyReason || '',
            location: this.promiseNode.promiseInfo.enclosingFunction.file,
            relativeLineNumber:
                this.promiseNode.promiseInfo.relativeLineNumber.toString(),
            code: this.promiseNode.promiseInfo.enclosingFunction.sourceCode,
            statement: this.promiseNode.promiseInfo.code,
            testRunner: this.rc.testRunner,
            executionPath: this.executionPathString,
            asyncFunctionDefinition: this.promiseNode.promiseInfo
                .asyncFunctionDefinition
                ? `Here is the definition of the async function that returns the promise:\n\`\`\`${
                      this.promiseNode.promiseInfo.asyncFunctionDefinition
                          .sourceCode
                  }\n\`\`\``
                : '',
            moduleSystem: detectModuleSystem(
                path.join(
                    RuntimeConfig.getInstance().config.projectPath,
                    this.promiseNode.promiseInfo.location.file,
                ),
            ),
            testMetaData: this.testMetaData,
        };

        return Prompt.replacePlaceholders(UserMessageIncomplete, placeholders);
    }
}
