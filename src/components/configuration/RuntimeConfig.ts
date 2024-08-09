import * as fs from "fs"
import * as path from "path"
import {Configuration} from "../../types/Configuration.type";
import {PROMITEST_CONFIG_FILE_NAME} from "../../constants/constants";
import logger from "../../logging/logger";


export default class RuntimeConfig {
    private static instance: RuntimeConfig;
    readonly originalProjectPath: string;
    private readonly _config: Configuration;

    constructor(projectPath: string) {
        try {
            this.originalProjectPath = projectPath;
            projectPath += projectPath.endsWith("/") ? "" : "/";
            const rc = JSON.parse(fs.readFileSync(path.join(projectPath, PROMITEST_CONFIG_FILE_NAME), 'utf-8'))
            let projectName = projectPath.split("/").slice(-2, -1)[0]; // To handle trailing slashes
            logger.info(`Project Name: ${projectName}`);
            logger.info(`Project Path: ${projectPath}`);
            logger.info(`Config File: ${JSON.stringify(rc, null, 2)}`);
            this._config = {
                projectPath,
                projectName,
                ...rc
            }
        } catch (e) {
            logger.error('Could not parse config file:', {message: e});
            throw new Error('Could not parse config file.');
        }
        console.log(`Project Configuration: ${JSON.stringify(this.config, null, 2)}`)
    }

    get config(): Configuration {
        return this._config;
    }

    public static getInstance(projectPath?: string): RuntimeConfig {
        if (projectPath) {
            if (RuntimeConfig?.instance?.originalProjectPath === projectPath) {
                return RuntimeConfig.instance;
            } else {
                RuntimeConfig.instance = new RuntimeConfig(projectPath);
                return RuntimeConfig.instance;
            }
        } else {
            if (!RuntimeConfig.instance) {
                throw new Error('RuntimeConfig is not instantiated and projectPath is missing');
            } else {
                return RuntimeConfig.instance;
            }
        }
    }
}
