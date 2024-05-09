import { PromiseNode } from "./PromiseNode";
import { PromiseIdentifier } from "../types/CoverageAnalyzer.type";
import { NodeDirectory, PromiseAdjacencyMap } from "../types/PromiseGraph.types";

export class PromiseGraph {
    adjacencyMap: PromiseAdjacencyMap = new Map();
    nodeDirectory: NodeDirectory;
    sortedNodes?: PromiseIdentifier[];

    constructor(nodeDirectory: NodeDirectory) {
        this.nodeDirectory = nodeDirectory;
    }

    addNode(identifier: PromiseIdentifier, newNode: PromiseNode) {
        if (!this.nodeDirectory.has(identifier)) {
            this.nodeDirectory.set(identifier, newNode);
        }

        if (!this.adjacencyMap.has(identifier)) {
            this.adjacencyMap.set(identifier, []);
        }

        const {
            parent: chainedParent,
            links: linkedParents,
            inputs: bundledParents,
        } = newNode.promiseInfo;

        if (chainedParent) {
            if (!this.adjacencyMap.has(chainedParent))
                this.addNode(chainedParent, this.nodeDirectory.get(chainedParent)!);
            this.adjacencyMap.get(chainedParent)?.push(newNode);
        }

        if (linkedParents) this.addParents(linkedParents, newNode);
        if (bundledParents) this.addParents(bundledParents, newNode);
    }

    addParents(parentList: PromiseIdentifier[], newNode: PromiseNode) {
        parentList?.forEach((parentIdentifier: PromiseIdentifier) => {
            if (!this.adjacencyMap.has(parentIdentifier))
                this.addNode(
                    parentIdentifier,
                    this.nodeDirectory.get(parentIdentifier)!,
                );
            this.adjacencyMap.get(parentIdentifier)?.push(newNode);
        });
    }

    setSortedNodes(sortedNodes: PromiseIdentifier[]) {
        this.sortedNodes = sortedNodes;
    }
}
