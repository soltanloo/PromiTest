import {PromiseNode} from "./PromiseNode";
import RuntimeConfig from "./RuntimeConfig";
import {Configuration} from "../types/Configuration.type";

export abstract class Prompt {
    promiseNode: PromiseNode;
    rc: Configuration;
    string: string;

    constructor(promiseNode: PromiseNode) {
        this.promiseNode = promiseNode;
        this.rc = RuntimeConfig.getInstance().config;
        this.string = this.getPromptText();
    }

    get neverRejected(): boolean {
        return this.promiseNode.promiseInfo.warnings.rejection;
    }

    get neverResolved(): boolean {
        return this.promiseNode.promiseInfo.warnings.fulfillment;
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

    static replacePlaceholders(template: string, data: { [key: string]: string }): string {
        return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()]);
    }

    abstract getPromptText(): string;
}