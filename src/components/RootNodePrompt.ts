import {Prompt} from "./Prompt";
import {rootNodePromptTemplate} from "../prompt-templates/RootNodePromptTemplate";

export class RootNodePrompt extends Prompt {
    getPromptText(): string {
        const placeholders = {
            promiseType: this.promiseNode.promiseInfo.type,
            notStatus: this.neverRejected ? "Rejected" : "Resolved",
            potentiallyStatus: this.isFulfillable ? "Resolvable" : "Rejectable",
            candidacyReason: this.candidacyReason || '',
            location: this.promiseNode.promiseInfo.location,
            code: this.promiseNode.promiseInfo.code,
            testRunner: this.rc.testRunner,
            //TODO: executionPath: ,
        }

        return Prompt.replacePlaceholders(rootNodePromptTemplate, placeholders);
    }
}