import {PromiseNode} from "./PromiseNode";
import {PromptGenerationStrategy} from "./PromptGenerationStrategy";
import {Prompt} from "./Prompt";
import {RootNodePrompt} from "./RootNodePrompt";
import {CallGraph} from "./CallGraph";

export class RootNodePromptGenerationStrategy implements PromptGenerationStrategy {
    generatePrompt(node: PromiseNode, callgraph: CallGraph): Prompt {
        const shortestPath = callgraph.findShortestPathFromTestsTo(node.promiseInfo.location.encoded).map(nodeId => callgraph.getNode(nodeId)!)
        return new RootNodePrompt(node, shortestPath);
    }
}