import {JSCallgraphOutput} from "../types/Callgraph.type";
import path from "path";
// @ts-ignore
import JCG from '@persper/js-callgraph';
import RuntimeConfig from "./RuntimeConfig";


export default class CallgraphGenerator {
    private readonly _jscallgraph: JSCallgraphOutput;

    constructor() {
        const RC = RuntimeConfig.getInstance();

        const callgraphsDirectory = path.resolve(path.join(__dirname, 'callgraphs'));
        let callgraphPath = path.join(callgraphsDirectory, `${RC.config.projectName}.json`)

        const args = {strategy: "FULL", output: [callgraphPath], cg: 'cg'};
        JCG.setArgs(args);
        JCG.setFiles([RC.config.projectPath + '/']);
        JCG.setFilter(['+^.*\\.js$', '-^.*node_modules\\/.*\\.js$',]);
        JCG.setConsoleOutput(false);
        this._jscallgraph = JCG.build();
    }

}