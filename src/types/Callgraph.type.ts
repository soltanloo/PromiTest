export interface Position {
    row: number;
    column: number;
}

interface Range {
    start: number;
    end: number;
}

export interface FileDetails {
    label: string;
    file: string;
    start: Position;
    end: Position;
    range: Range;
}

interface CallgraphEdge {
    source: FileDetails;
    target: FileDetails;
}

export type JSCallgraphOutput = CallgraphEdge[];

export interface FunctionDefinition {
    name: string;
    file: string;
    start: Position;
    end: Position;
}