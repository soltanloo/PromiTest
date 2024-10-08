import { report } from 'node:process';
import { LLM } from '../types/LLM.type';
import { clear } from 'node:console';

export const PROMITEST_CONFIG_FILE_NAME = 'promitest.config.json';

export const CLI_ARGS = {
    projectPath: 'projectPath',
    coverageReport: 'coverageReport',
    coverageReportShort: 'co',
    useAvailableCoverageReport: 'useAvailableCoverageReport',
    useAvailableCoverageReportShort: 'u',
    directoryPath: 'directoryPath',
    batch: 'batch',
    batchShort: 'b',
    report: 'report',
    reportShort: 'r',
    cycleLLMs: 'cycleLLMs',
    cycleLLMsShort: 'cl',
    clear: 'clear',
    clearShort: 'c',
};
export const LLMS_FOR_CYCLE = [
    LLM.Model.GPT35TURBO,
    LLM.Model.GPT4OMINI,
    LLM.Model.MISTRAL_8X7B,
    LLM.Model.PHI_3_MINI_4k,
];
export const asyncCoverageReport = 'async-coverage-report.json';
