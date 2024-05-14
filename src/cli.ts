import {CLI_ARGS} from "./components/constants";
import {Command} from 'commander';
import RuntimeConfig from "./components/RuntimeConfig";

async function cli(projectPath: string) {
    RuntimeConfig.getInstance(projectPath);

    //TODO: run Main
}

(async function () {
    const program = new Command();

    program
        .name('promitest')
        .description('Automated test generation for Asynchronous JavaScript')

    program
        .command('generate')
        .argument(`<${CLI_ARGS.projectPath}>`, 'path to project')

    program.parse(process.argv);


    try {
        await cli(program.args[1])
    } catch (err) {
        console.error(`Error in running cli():`)
        console.error(err)
    }
})()