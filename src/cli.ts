import { asyncCoverageReport, CLI_ARGS } from './constants/constants';
import { Command } from 'commander';
import RuntimeConfig from './components/configuration/RuntimeConfig';
import { Main } from './components/Main';
import logger from './utils/logger';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

async function cli(
    projectPath: string,
    reportGeneration: boolean,
    coverageReportPath?: string,
) {
    dotenv.config();
    const runtimeConfig = RuntimeConfig.getInstance(projectPath);

    runtimeConfig.setCoverageReportPath(coverageReportPath);

    await Main.run();
}

async function clearTestFiles(projectPath: string) {
    try {
        //in projectPath, import promitest.config.json
        const configPath = path.join(projectPath, 'promitest.config.json');
        if (!fs.existsSync(configPath)) {
            logger.warn(
                'promitest.config.json not found in project directory.',
            );
            return;
        }
        const promitestConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const testFolderPath = path.join(
            projectPath,
            promitestConfig.testDirectory,
        );
        const files = fs.readdirSync(testFolderPath);

        files.forEach((file) => {
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

async function batchRun(directoryPath: string, lookForCoverageReport: boolean) {
    try {
        const directories = fs
            .readdirSync(directoryPath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => path.join(directoryPath, dirent.name));
        logger.debug(`Directories found: ${directories}`);
        for (const dir of directories) {
            let coverageReportPath: string | undefined;
            if (lookForCoverageReport) {
                const potentialReportPath = path.join(dir, asyncCoverageReport);
                if (fs.existsSync(potentialReportPath)) {
                    coverageReportPath = potentialReportPath;
                    logger.info(
                        `Found coverage report at: ${coverageReportPath}`,
                    );
                } else {
                    logger.warn(
                        `Coverage report not found in directory: ${dir}`,
                    );
                }
            }

            logger.info(`Running generate command for directory: ${dir}`);
            await cli(dir, false, coverageReportPath);
        }

        logger.info('Batch command completed.');
    } catch (err) {
        logger.error('Error in batchRun():');
        logger.error(err);
    }
}

async function clearAll(directoryPath: string) {
    try {
        const directories = fs
            .readdirSync(directoryPath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => path.join(directoryPath, dirent.name));

        for (const dir of directories) {
            logger.info(`Running clear command for directory: ${dir}`);
            await clearTestFiles(dir);
        }

        logger.info('Clear-all command completed.');
    } catch (err) {
        logger.error('Error in clearAll():');
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
            `-${CLI_ARGS.coverageReportShort}, --${CLI_ARGS.coverageReport} <coverageReportPath>`,
            'read coverage report from file',
        )
        .option(
            `-${CLI_ARGS.useAvailableCoverageReportShort}, --${CLI_ARGS.useAvailableCoverageReport}`,
            'look for async-coverage-report.json in each directory',
        )
        .option(
            `-${CLI_ARGS.batchShort}, --${CLI_ARGS.batch}`,
            'run generate command for each project in directory',
        )
        .option(
            `-${CLI_ARGS.reportShort}, --${CLI_ARGS.report}`,
            'generate report after running tests',
        )
        .option(
            `-${CLI_ARGS.cycleLLMsShort}, --${CLI_ARGS.cycleLLMs}`,
            'cycle through each LLM for report generation',
        )
        .action(async (projectPath, options) => {
            try {
                let coverageReportPath: string | undefined;
                // Check if the user provided a coverage report with -c
                if (options.report) {
                    RuntimeConfig;
                }
                if (!options.batch) {
                    if (options.coverageReport) {
                        if (fs.existsSync(options.coverageReport)) {
                            coverageReportPath = options.coverageReport;
                            logger.info(
                                `Using coverage report from provided path: ${coverageReportPath}`,
                            );
                        } else {
                            logger.warn(
                                `Provided coverage report not found at: ${options.coverageReport}`,
                            );
                        }
                    }

                    // If no valid coverage report was provided and -u was used, look for the async-coverage-report.json
                    if (
                        !coverageReportPath &&
                        options.useAvailableCoverageReport
                    ) {
                        const potentialReportPath = path.join(
                            projectPath,
                            asyncCoverageReport,
                        );
                        if (fs.existsSync(potentialReportPath)) {
                            coverageReportPath = potentialReportPath;
                            logger.info(
                                `Using available coverage report at: ${coverageReportPath}`,
                            );
                        } else {
                            logger.warn(
                                'No async-coverage-report.json file found in the project directory.',
                            );
                        }
                    }
                    await cli(projectPath, false, coverageReportPath);
                } else {
                    logger.info('Batch mode enabled');
                    batchRun(projectPath, options.useAvailableCoverageReport);
                }
            } catch (err) {
                logger.error('Error in running cli():');
                logger.error(err);
            }
        });

    program
        .command('clear')
        .argument(`<${CLI_ARGS.projectPath}>`, 'path to project')
        .option(
            `-${CLI_ARGS.batchShort}, --${CLI_ARGS.batch}`,
            'run clear command for each project in directory',
        )
        .action(async (projectPath, options) => {
            try {
                if (options.batch) {
                    logger.info('Batch mode enabled');
                    await clearAll(projectPath);
                } else {
                    await clearTestFiles(projectPath);
                }
            } catch (err) {
                logger.error('Error in running clear command:');
                logger.error(err);
            }
        });
    program.parse(process.argv);
})();
