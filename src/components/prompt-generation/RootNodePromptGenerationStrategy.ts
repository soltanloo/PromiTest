import { PromiseNode } from '../promise-graph/PromiseNode';
import { PromptGenerationStrategy } from './PromptGenerationStrategy';
import { Prompt } from './Prompt';
import { RootNodePrompt } from './RootNodePrompt';
import { CallGraph } from '../call-graph/CallGraph';

export class RootNodePromptGenerationStrategy
    implements PromptGenerationStrategy
{
    generatePrompt(node: PromiseNode, callgraph: CallGraph): Prompt {
        const shortestPath = callgraph
            .findShortestPathFromTestsTo(
                node.promiseInfo.enclosingFunction.location,
            )
            .map((nodeId) => callgraph.getNode(nodeId)!);
        return new RootNodePrompt(node, shortestPath);
    }
}
