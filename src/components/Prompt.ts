import {PromiseNode} from "./PromiseNode";

export abstract class Prompt {
    promiseNode: PromiseNode;

    constructor(promiseNode: PromiseNode) {
        this.promiseNode = promiseNode;
    }

    get neverRejected(): boolean {
        return !!this.promiseNode.promiseInfo.warnings.rejection;
    }

    get neverResolved(): boolean {
        return !!this.promiseNode.promiseInfo.warnings.fulfillment;
    }

    get isFulfillable(): boolean {
        return !!this.promiseNode.flags.fulfillable;
    }

    get isRejectable(): boolean {
        return !!this.promiseNode.flags.rejectable;
    }

    get candidacyReason(): string | undefined {
        if (this.isFulfillable) {
            switch (this.promiseNode.promiseInfo.type) {
                case "NewPromise":
                    return "contains a call to resolve() function"
            }
        }
        if (this.isRejectable) {
            switch (this.promiseNode.promiseInfo.type) {
                case "NewPromise":
                    return "contains a call to reject() function or a throw keyword"
            }
        }
    }

    abstract getPromptText(): string;
}