import { PromiseNode } from '../promise-graph/PromiseNode';
import { PromptGenerationStrategy } from './PromptGenerationStrategy';
import { Prompt } from './Prompt';
import { RootNodePrompt } from './RootNodePrompt';
import { CallGraph } from '../call-graph/CallGraph';
import { P_TYPE } from '../../types/JScope.type';

export class RootNodePromptGenerationStrategy
    implements PromptGenerationStrategy
{
    generatePrompt(node: PromiseNode, callgraph: CallGraph): Prompt {
        let location =
            node.promiseInfo.type === P_TYPE.AsyncFunction
                ? node.promiseInfo.asyncFunctionDefinition!.location
                : node.promiseInfo.enclosingFunction.location;
        const shortestPath = callgraph
            .findShortestPathFromTestsTo(location)
            .map((nodeId) => callgraph.getNode(nodeId)!);
        return new RootNodePrompt(node, shortestPath);
    }
}
