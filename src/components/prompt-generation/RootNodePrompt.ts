import {Prompt} from "./Prompt";
import {rootNodePromptTemplate} from "../../prompt-templates/RootNodePromptTemplate";
import {PromiseNode} from "../promise-graph/PromiseNode";
import {Node} from "../../types/Graph.type";

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

exported: ${node.fileDetails.exported}
---`;
        }
        return executionPathString;
    }

    getPromptText(): string {
        const placeholders = {
            promiseType: this.promiseNode.promiseInfo.type,
            notStatus: this.promiseNode.neverRejected ? "Rejected" : "Resolved",
            potentiallyStatus: this.promiseNode.isRejectable ? "Rejectable" : "Resolvable",
            candidacyReason: this.candidacyReason || '',
            location: this.promiseNode.promiseInfo.enclosingFunction.file,
            code: this.promiseNode.promiseInfo.enclosingFunction.sourceCode,
            testRunner: this.rc.testRunner,
            executionPath: this.executionPathString,
        }

        return Prompt.replacePlaceholders(rootNodePromptTemplate, placeholders);
    }
}