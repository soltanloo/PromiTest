import { PromiseNode } from '../promise-graph/PromiseNode';
import RuntimeConfig from '../configuration/RuntimeConfig';
import { Configuration } from '../../types/Configuration.type';

export abstract class Prompt {
    promiseNode: PromiseNode;
    rc: Configuration;
    string: string;

    constructor(promiseNode: PromiseNode) {
        this.promiseNode = promiseNode;
        this.rc = RuntimeConfig.getInstance().config;
        this.string = this.getPromptText();
    }

    get candidacyReason(): string | undefined {
        if (this.promiseNode.isFulfillable) {
            switch (this.promiseNode.promiseInfo.type) {
                case 'NewPromise':
                    return 'contains a call to resolve() function';
            }
        }
        if (this.promiseNode.isRejectable) {
            switch (this.promiseNode.promiseInfo.type) {
                case 'NewPromise':
                    return 'contains a call to reject() function or a throw keyword';
            }
        }
    }

    static replacePlaceholders(
        template: string,
        data: { [key: string]: string },
    ): string {
        return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()]);
    }

    abstract getPromptText(): string;
}
