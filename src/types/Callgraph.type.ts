import {Position, Range} from "./File.type";

export interface FileDetails {
    label: string;
    file: string;
    start: Position;
    end: Position;
    range: Range;
    exported: boolean;
}

interface CallgraphEdge {
    source: FileDetails;
    target: FileDetails;
}

export type JSCallgraphOutput = CallgraphEdge[];

export interface FunctionDefinition {
    location: string;
    name: string;
    file: string;
    start: Position;
    end: Position;
    exportInfo: { exported: boolean, defaultExport: boolean, exportedAs: string | undefined };
    sourceCode: string;
}