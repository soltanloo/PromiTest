import { Prompt } from './Prompt';
import { rootNodePromptTemplate } from '../../prompt-templates/RootNodePromptTemplate';
import { PromiseNode } from '../promise-graph/PromiseNode';
import { Node } from '../../types/Graph.type';
import { detectModuleSystem } from '../../utils/AST';
import path from 'path';
import RuntimeConfig from '../configuration/RuntimeConfig';
import { P_TYPE } from '../../types/JScope.type';

export class RootNodePrompt extends Prompt {
    executionPathString: string;

    constructor(promiseNode: PromiseNode, executionPath: Node[]) {
        super(promiseNode);
        this.executionPathString = this.executionPathToString(executionPath);
        this.string = this.getPromptText();
    }

    executionPathToString(executionPath: Node[]): string {
        let executionPathString = '';
        for (const node of executionPath) {
            executionPathString += `Location: ${node.fileDetails.file}
            
            ${node.fileDetails.sourceCode}
            
            exported: ${node.fileDetails.exportInfo.exported}
            isDefaultExport: ${node.fileDetails.exportInfo.defaultExport}
            ${node.fileDetails.exportInfo.exportedAs ? 'exportedAs: ' + node.fileDetails.exportInfo.exportedAs : ''}
            ---`;
        }
        return executionPathString;
    }

    getPromptText(): string {
        const placeholders = {
            promiseType: this.promiseNode.promiseInfo.type,
            notStatus: this.promiseNode.neverRejected ? 'Rejected' : 'Resolved',
            potentiallyStatus: this.promiseNode.isRejectable
                ? 'Rejectable'
                : 'Resolvable',
            candidacyReason: this.candidacyReason || '',
            location: this.promiseNode.promiseInfo.enclosingFunction.file,
            line: (this.promiseNode.promiseInfo.location.start.row - this.promiseNode.promiseInfo.enclosingFunction.start.row + 1).toString(),
            code: this.promiseNode.promiseInfo.enclosingFunction.sourceCode,
            testRunner: this.rc.testRunner,
            executionPath: this.executionPathString,
            asyncFunctionDefinition: `Here is the definition of the async function that returns the promise:\n${
                this.promiseNode.promiseInfo.asyncFunctionDefinition
                    ?.sourceCode || ''
            }`,
            moduleSystem: detectModuleSystem(
                path.join(
                    RuntimeConfig.getInstance().config.projectPath,
                    this.promiseNode.promiseInfo.location.file,
                ),
            ),
        };

        return Prompt.replacePlaceholders(rootNodePromptTemplate, placeholders);
    }
}
