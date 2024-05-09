import {Prompt} from "./Prompt";

export class RootNodePrompt extends Prompt {
    getPromptText(): string {
        return `This is a promise of type "${this.promiseNode.promiseInfo.type}", which is not ${this.neverRejected ? "Rejected" : "Resolved"} by the current test suite. It's potentially ${this.isFulfillable ? "Resolvable" : "Rejectable"} because it ${this.candidacyReason}.If possible, generate a test that can cover this execution path.
        
        Location: ${this.promiseNode.promiseInfo.location}
        
        ${this.promiseNode.promiseInfo.code}`;
    }
}