import {PromiseNode} from "./PromiseNode";
import {PromiseInfo} from "./CoverageAnalyzer";

export class PromiseGraph {
    adjacencyList: Map<number, PromiseNode[]>;

    constructor() {
        this.adjacencyList = new Map();
    }

    addNode(identifier: number, info: PromiseInfo) {
        if (!this.adjacencyList.has(identifier)) {
            this.adjacencyList.set(identifier, []);
        }
        const newNode = new PromiseNode(identifier, info);
        this.adjacencyList.forEach((value, key) => {
            if (info.links.includes(key)) {
                value.push(newNode);
            } else if (key == identifier) {
                info.links.forEach(link => {
                    let linkedNode = this.findNodeById(link);
                    if (linkedNode) {
                        value.push(linkedNode);
                    }
                });
            }
        });
    }

    findNodeById(identifier: number): PromiseNode | undefined {
        let foundNode: PromiseNode | undefined = undefined;
        this.adjacencyList.forEach((value, key) => {
            if (key == identifier) {
                foundNode = new PromiseNode(key, value[0].promiseInfo);
            }
        });
        return foundNode;
    }
}