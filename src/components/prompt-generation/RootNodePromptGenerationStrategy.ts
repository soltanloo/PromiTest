import { PromiseNode } from '../promise-graph/PromiseNode';
import { PromptGenerationStrategy } from './PromptGenerationStrategy';
import { Prompt } from './Prompt';
import { RootNodePrompt } from './RootNodePrompt';
import { CallGraph } from '../call-graph/CallGraph';
import { P_TYPE } from '../../types/JScope.type';
import { extractTestMetaData } from '../../utils/AST';
import { PromiseFlagTypes } from '../../types/PromiseGraph.type';

export class RootNodePromptGenerationStrategy
    implements PromptGenerationStrategy
{
    generatePrompt(
        node: PromiseNode,
        flag: PromiseFlagTypes,
    ): Prompt | undefined {
        let location =
            node.promiseInfo.type === P_TYPE.AsyncFunction
                ? node.promiseInfo.asyncFunctionDefinition!.location
                : node.promiseInfo.enclosingFunction.location;
        const shortestPathPid = node.findPidWithShortestExecutionPath();
        const shortestPath = node.promiseInfo.stackTraces[shortestPathPid];

        if (!(shortestPathPid in node.promiseInfo.testInfo)) return undefined;

        const testInfo = node.promiseInfo.testInfo[shortestPathPid];
        const testMetaData = extractTestMetaData(
            testInfo.file,
            testInfo.titlePath,
        );

        return new RootNodePrompt(
            node,
            shortestPath,
            testInfo.file,
            testMetaData,
            flag,
        );
    }
}
