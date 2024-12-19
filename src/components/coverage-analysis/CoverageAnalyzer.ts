import {
    PromiseCoverageReport,
    PromiseIdentifier,
    PromiseInfo,
    PromiseLocation,
    PromiseStackTracesInfo,
    PromiseType,
} from '../../types/CoverageAnalyzer.type';
import RuntimeConfig from '../configuration/RuntimeConfig';
import { Configuration } from '../../types/Configuration.type';
import * as process from 'node:process';
import { sh } from '../../utils/sh';
import {
    JScopeCoverageReport,
    P_TYPE,
    Pid,
    PInfo,
    PMap,
} from '../../types/JScope.type';
import FileRepository from '../apis/FileRepository';
import path from 'path';
import { FunctionDefinition } from '../../types/Callgraph.type';
import logger from '../../utils/logger';

export class CoverageAnalyzer {
    coverageData?: PromiseCoverageReport;
    projectName: string;
    projectPath: string;
    rawCoverageReport!: JScopeCoverageReport;
    RC: Configuration;
    readonly JSCOPE_PATH = process.env.JSCOPE_PATH;
    private _pidToIdMap: Map<number, number> = new Map();

    constructor() {
        logger.debug('Initializing CoverageAnalyzer');
        this.RC = RuntimeConfig.getInstance().config;
        this.projectName = this.RC.projectName;
        this.projectPath = this.RC.projectPath;
        logger.info(
            `Initialized CoverageAnalyzer for project: ${this.projectName}, path: ${this.projectPath}`,
        );
    }

    public async analyze(): Promise<PromiseCoverageReport> {
        let coverageReportPath =
            RuntimeConfig.getInstance().config.coverageReportPath;
        let filePath: string;
        if (coverageReportPath) {
            logger.info('Using provided coverage report path');
            filePath = coverageReportPath;
        } else {
            logger.info('Starting analysis with JScope');
            await this.runJScope();
            logger.debug('JScope execution completed');
            filePath = `${this.projectPath}/async-coverage-report.json`;
        }
        this.rawCoverageReport = await this.readReport(filePath);
        logger.debug('Coverage report read successfully');

        this.coverageData = this.refineReport();
        logger.info('Refined coverage report generated');

        return this.coverageData;
    }

    refineReport(
        report: JScopeCoverageReport = this.rawCoverageReport,
    ): PromiseCoverageReport {
        logger.debug('Refining coverage report');
        let promiseMap = report.promiseMap;
        let functionsMap = report.functionsMap;
        let refinedCoverageReport: PromiseCoverageReport = [];

        this.populatePidToIdMap(promiseMap);

        Object.entries(promiseMap).forEach(([promiseId, promiseObject]) => {
            let refinedPromiseInfo = this.refinePromiseObject(
                promiseObject,
                promiseId,
            );

            refinedCoverageReport.push(refinedPromiseInfo);
            logger.info(`Promise ${promiseId} refined and added to the report`);
        });

        return refinedCoverageReport;
    }

    // pid is the id of an instance, id or promiseId is the iid that is location-based
    populatePidToIdMap(promiseMap: PMap) {
        Object.entries(promiseMap).forEach(([promiseId, promiseObject]) => {
            promiseObject.pids.forEach((id) => {
                const pidNumber = this.extractPromiseIdFromString(id);
                if (pidNumber)
                    this._pidToIdMap.set(pidNumber, Number(promiseId));
            });
        });
    }

    async readReport(filePath: string): Promise<JScopeCoverageReport> {
        logger.debug(`Reading coverage report from ${filePath}`);
        try {
            let { default: rawCoverageReport } = await import(filePath);
            logger.info('Coverage report loaded successfully');
            return rawCoverageReport as JScopeCoverageReport;
        } catch (error) {
            logger.error('Error occurred while fetching Coverage Report:', {
                message: error,
            });
            throw new Error('Error occurred while fetching Coverage Report');
        }
    }

    private refinePromiseObject(promiseObject: PInfo, promiseId: string) {
        let decodedPromiseLocation = this.decodeLocation(
            promiseObject.location,
        );
        logger.debug(
            `Decoded location for promise ${promiseId}: ${JSON.stringify(decodedPromiseLocation)}`,
        );

        let enclosingFunctionOfPromiseObject =
            FileRepository.getEnclosingFunction(
                path.join(this.projectPath, decodedPromiseLocation.file),
                {
                    startPosition: decodedPromiseLocation.start,
                    endPosition: decodedPromiseLocation.end,
                },
            );
        if (enclosingFunctionOfPromiseObject) {
            logger.debug(
                `Enclosing function found for promise ${promiseId}: ${enclosingFunctionOfPromiseObject.name}`,
            );
        } else {
            //TODO: The whole file would be an alternative to the non-existent enclosing function
            logger.warn(`No enclosing function found for promise ${promiseId}`);
        }

        let enrichedStackTraces: PromiseStackTracesInfo = {};

        Object.entries(promiseObject.stackTraces).forEach(
            ([pid, stackTrace]) => {
                let enrichedStackTrace: FunctionDefinition[] = [];

                stackTrace.forEach((functionLocation) => {
                    let decodedFunctionLocation =
                        this.decodeLocation(functionLocation);
                    let enclosingFunction = FileRepository.getEnclosingFunction(
                        path.join(
                            this.projectPath,
                            decodedFunctionLocation.file,
                        ),
                        {
                            startPosition: decodedFunctionLocation.start,
                            endPosition: decodedFunctionLocation.end,
                        },
                    );

                    if (enclosingFunction)
                        enrichedStackTrace.push(enclosingFunction);
                    else {
                        logger.error(
                            `Enclosing function not found for ${functionLocation}`,
                        );
                    }
                });

                enrichedStackTraces[pid as Pid] = enrichedStackTrace;
            },
        );

        let warnings = this.getWarningsOfPromise(promiseObject);
        logger.debug(
            `Warnings for promise ${promiseId}: ${JSON.stringify(warnings)}`,
        );

        let asyncFunctionDefinition =
            this.extractAsyncFunctionDefinition(promiseObject);

        let refinedPromiseInfo: PromiseInfo = {
            identifier: Number(promiseId),
            enclosingFunction: enclosingFunctionOfPromiseObject!,
            location: decodedPromiseLocation,
            relativeLineNumber:
                decodedPromiseLocation.start.row -
                enclosingFunctionOfPromiseObject!.start.row +
                1,
            asyncFunctionDefinition,
            isApiCall: this.isPromiseReturnedByApi(promiseObject),
            type: asyncFunctionDefinition
                ? P_TYPE.AsyncFunction
                : (promiseObject.type as PromiseType),
            warnings,
            code: promiseObject.code ?? '',
            links: promiseObject.links.map((link) => Number(link.id)),
            stackTraces: enrichedStackTraces,
            testInfo: promiseObject.testInfo,
        };

        if (promiseObject.parent) {
            const parentPidNumber = this.extractPromiseIdFromString(
                promiseObject.parent,
            );
            if (parentPidNumber) {
                refinedPromiseInfo.parent =
                    this._pidToIdMap.get(parentPidNumber);
                logger.debug(
                    `Parent promise id for ${promiseId}: ${refinedPromiseInfo.parent}`,
                );
            }
        }
        return refinedPromiseInfo;
    }

    private isPromiseReturnedByApi(promiseObject: PInfo): boolean {
        const nativePromiseRegex =
            /\b(Promise\.(resolve|reject|all|race|allSettled|any)|new\s+Promise)|\.\s*(then|catch|finally)\s*\(/;
        return !!(
            promiseObject.type === P_TYPE.NewPromise &&
            !promiseObject._types.includes(P_TYPE.AsyncFunction) &&
            // (
            //     promiseObject.settle.fulfill.length ||
            //     promiseObject.settle.reject.length
            // ) &&
            promiseObject.code &&
            !nativePromiseRegex.test(promiseObject.code)
        );
    }

    private extractAsyncFunctionDefinition(
        promiseObject: PInfo,
    ): FunctionDefinition | undefined {
        let isAsync = false;
        let settlementFunction;
        if (
            promiseObject.type === P_TYPE.AsyncFunction ||
            (promiseObject.type === P_TYPE.NewPromise &&
                promiseObject._types.includes(P_TYPE.AsyncFunction))
        ) {
            settlementFunction = [
                ...promiseObject.settle.fulfill,
                ...promiseObject.settle.reject,
            ].find((func) => func.tag === 'settle' && !!func?.location);
        }
        if (settlementFunction) {
            let decodedAsyncFunctionLocation = this.decodeLocation(
                settlementFunction.location,
            );
            decodedAsyncFunctionLocation.start.column;
            decodedAsyncFunctionLocation.end.column;

            return FileRepository.getFunctionDefinition(
                path.join(this.projectPath, decodedAsyncFunctionLocation.file),
                {
                    startPosition: decodedAsyncFunctionLocation.start,
                },
            );
        }
    }

    private getWarningsOfPromise(promiseObject: PInfo) {
        return {
            fulfillment: promiseObject.coverage.settle_fulfill === false,
            fulfillReactionRegistration:
                promiseObject.coverage.register_fulfill === false,
            fulfillReactionExecution:
                promiseObject.coverage.execute_fulfill === false,
            rejection: promiseObject.coverage.settle_reject === false,
            rejectReactionRegistration:
                promiseObject.coverage.register_reject === false,
            rejectReactionExecution:
                promiseObject.coverage.execute_reject === false,
        };
    }

    private async runJScope(): Promise<void> {
        let cmd = `node ${this.JSCOPE_PATH} ${this.projectPath} ${this.projectName} --relativePaths`;
        logger.debug(`Running JScope with command: ${cmd}`);
        try {
            await sh(cmd);
            logger.info('JScope run completed successfully');
        } catch (error) {
            logger.error(
                'Error occurred while running JScope on the project:',
                { message: error },
            );
            throw new Error(
                'Error occurred while running JScope on the project',
            );
        }
    }

    private decodeLocation(location: string): PromiseLocation {
        logger.debug(`Decoding location: ${location}`);
        const parts = location.split(':');

        return {
            encoded: location,
            file: parts[0],
            start: {
                row: parseInt(parts[1], 10),
                column: parseInt(parts[2], 10),
            },
            end: {
                row: parseInt(parts[3], 10),
                column: parseInt(parts[4], 10),
            },
        };
    }

    private extractPromiseIdFromString(
        pid: Pid | null,
    ): PromiseIdentifier | undefined {
        if (pid === null || pid === undefined) {
            logger.debug(
                'Promise ID is null or undefined, skipping extraction',
            );
            return;
        }
        const match = pid.match(/\d+/);
        return match ? parseInt(match[0], 10) : undefined;
    }
}
