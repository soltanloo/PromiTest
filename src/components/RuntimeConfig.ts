import * as fs from "fs"
import * as path from "path"
import {Configuration} from "../types/Configuration.type";
import {PROMITEST_CONFIG_FILE_NAME} from "./constants";


export default class RuntimeConfig {
    private static instance: RuntimeConfig;
    private readonly _config: Configuration;

    constructor(projectPath: string) {
        try {
            const rc = JSON.parse(fs.readFileSync(path.join(projectPath, PROMITEST_CONFIG_FILE_NAME), 'utf-8'))
            let projectName = projectPath.split("/").pop() as string;
            this._config = {
                projectPath,
                projectName,
                ...rc
            }
        } catch (e) {
            throw new Error('Could not parse config file.');
        }
        console.log(`Project Configuration: ${JSON.stringify(this.config, null, 2)}`)
    }

    get config(): Configuration {
        return this._config;
    }

    public static getInstance(projectPath?: string): RuntimeConfig {
        if (!RuntimeConfig.instance) {
            if (projectPath) {
                RuntimeConfig.instance = new RuntimeConfig(projectPath);
            } else {
                throw new Error('RuntimeConfig is not instantiated and projectPath is missing');
            }
        }
        return RuntimeConfig.instance;
    }
}
