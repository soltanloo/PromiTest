import {Prompt} from "./Prompt";
import {rootNodePromptTemplate} from "../prompt-templates/RootNodePromptTemplate";
import {PromiseNode} from "./PromiseNode";
import {Node} from "../types/Graph.type";

export class RootNodePrompt extends Prompt {
    executionPathString: string;
    string: string;

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
            notStatus: this.neverRejected ? "Rejected" : "Resolved",
            potentiallyStatus: this.isFulfillable ? "Resolvable" : "Rejectable",
            candidacyReason: this.candidacyReason || '',
            location: this.promiseNode.promiseInfo.location.encoded,
            code: this.promiseNode.promiseInfo.code,
            testRunner: this.rc.testRunner,
            executionPath: this.executionPathString,
        }

        return Prompt.replacePlaceholders(rootNodePromptTemplate, placeholders);
    }
}