import * as fs from "fs";
import * as path from "path";
import { Configuration } from "../../types/Configuration.type";
import { PROMITEST_CONFIG_FILE_NAME } from "../../constants/constants";
import logger from "../../utils/logger";

export default class RuntimeConfig {
    private static instance: RuntimeConfig;
    readonly originalProjectPath: string;
    private readonly _config: Configuration;

    constructor(projectPath: string) {
        try {
            logger.debug(`Initializing RuntimeConfig with projectPath: ${projectPath}`);
            this.originalProjectPath = projectPath;
            projectPath += projectPath.endsWith("/") ? "" : "/";
            logger.debug(`Adjusted projectPath: ${projectPath}`);
            
            const configFilePath = path.join(projectPath, PROMITEST_CONFIG_FILE_NAME);
            logger.debug(`Reading config file from: ${configFilePath}`);
            const rc = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
            
            let projectName = projectPath.split("/").slice(-2, -1)[0]; // To handle trailing slashes
            logger.debug(`Extracted projectName: ${projectName}`);
            this._config = {
                projectPath,
                projectName,
                ...rc
            };
            logger.info(`Successfully loaded project configuration for project: ${projectName}`);
        } catch (e) {
            logger.error('Could not parse config file:', { message: e });
            throw new Error('Could not parse config file.');
        }

        logger.info(`Project Configuration: ${JSON.stringify(this.config, null, 2)}`);
    }

    get config(): Configuration {
        return this._config;
    }

    public static getInstance(projectPath?: string): RuntimeConfig {
        if (projectPath) {
            logger.debug(`Retrieving instance of RuntimeConfig with projectPath: ${projectPath}`);
            if (RuntimeConfig?.instance?.originalProjectPath === projectPath) {
                logger.debug(`Returning existing instance for projectPath: ${projectPath}`);
                return RuntimeConfig.instance;
            } else {
                logger.debug(`Creating new instance for projectPath: ${projectPath}`);
                RuntimeConfig.instance = new RuntimeConfig(projectPath);
                return RuntimeConfig.instance;
            }
        } else {
            logger.debug(`Retrieving existing instance of RuntimeConfig`);
            if (!RuntimeConfig.instance) {
                logger.error('RuntimeConfig is not instantiated and projectPath is missing');
                throw new Error('RuntimeConfig is not instantiated and projectPath is missing');
            } else {
                return RuntimeConfig.instance;
            }
        }
    }
}
