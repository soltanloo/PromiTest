import { CLI_ARGS } from './constants/constants';
import { Command } from 'commander';
import RuntimeConfig from './components/configuration/RuntimeConfig';
import { Main } from './components/Main';
import logger from './utils/logger';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

async function cli(projectPath: string, coverageReportPath?: string) {
    dotenv.config();
    const runtimeConfig = RuntimeConfig.getInstance(projectPath);

    if (coverageReportPath) {
        runtimeConfig.setCoverageReportPath(coverageReportPath);
    }

    await Main.run();
}

async function clearTestFiles(projectPath: string) {
    try {
        const testFolderPath = path.join(projectPath, 'test');
        const files = fs.readdirSync(testFolderPath);

        files.forEach(file => {
            if (/^promise-\w+-\w+-test\.js$/.test(file)) {
                const filePath = path.join(testFolderPath, file);
                fs.unlinkSync(filePath);
                logger.info(`Deleted: ${filePath}`);
            }
        });

        logger.info('Clear command completed.');
    } catch (err) {
        logger.error('Error in clearTestFiles():');
        logger.error(err);
    }
}

(async function () {
    const program = new Command();

    program
        .name('promitest')
        .description('Automated test generation for Asynchronous JavaScript');

    program
        .command('generate')
        .argument(`<${CLI_ARGS.projectPath}>`, 'path to project')
        .option(
            `--${CLI_ARGS.coverageReport} <coverageReportPath>`,
            'read coverage report from file',
        )
        .action(async (projectPath, options) => {
            try {
                await cli(projectPath, options.coverageReport);
            } catch (err) {
                logger.error('Error in running cli():');
                logger.error(err);
            }
        });

    program
        .command('clear')
        .argument(`<${CLI_ARGS.projectPath}>`, 'path to project')
        .action(async (projectPath) => {
            try {
                await clearTestFiles(projectPath);
            } catch (err) {
                logger.error('Error in running clear command:');
                logger.error(err);
            }
        });

    program.parse(process.argv);
})();