import {PromiseNode} from "./PromiseNode";
import {PromiseIdentifier, PromiseInfo} from "./CoverageAnalyzer";

export class PromiseGraph {
    adjacencyMap: Map<PromiseIdentifier, PromiseNode[]> = new Map();

    constructor() {

    }

    addNode(identifier: PromiseIdentifier, info: PromiseInfo) {
        if (!this.adjacencyMap.has(identifier)) {
            this.adjacencyMap.set(identifier, []);
        }
        const newNode = new PromiseNode(identifier, info);
        this.adjacencyMap.forEach((value, key) => {
            if (info.links?.includes(key)) {
                value.push(newNode);
            } else if (key == identifier) {
                info.links?.forEach(link => {
                    let linkedNode = this.findNodeById(link);
                    if (linkedNode) {
                        value.push(linkedNode);
                    }
                });
            }
        });
    }

    findNodeById(identifier: PromiseIdentifier): PromiseNode | undefined {
        let foundNode: PromiseNode | undefined = undefined;
        this.adjacencyMap.forEach((value, key) => {
            if (key == identifier) {
                foundNode = new PromiseNode(key, value[0].promiseInfo);
            }
        });
        return foundNode;
    }
}