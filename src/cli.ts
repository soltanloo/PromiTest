import { CLI_ARGS } from './constants/constants';
import { Command } from 'commander';
import RuntimeConfig from './components/configuration/RuntimeConfig';
import { Main } from './components/Main';
import dotenv from 'dotenv';

async function cli(projectPath: string, coverageReportPath?: string) {
    dotenv.config();
    const runtimeConfig = RuntimeConfig.getInstance(projectPath);

    if (coverageReportPath) {
        runtimeConfig.setCoverageReportPath(coverageReportPath);
    }

    await Main.run();
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
                console.error('Error in running cli():');
                console.error(err);
            }
        });

    program.parse(process.argv);
})();
