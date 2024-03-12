import { PromiseNode } from "./PromiseNode";
import { PromiseIdentifier } from "./CoverageAnalyzer";

export type NodeDirectory = Map<PromiseIdentifier, PromiseNode>;

export class PromiseGraph {
  adjacencyMap: Map<PromiseIdentifier, PromiseNode[]> = new Map();
  nodeDirectory: NodeDirectory;

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
}
