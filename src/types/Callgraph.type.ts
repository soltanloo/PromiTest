export interface Position {
    row: number | null;
    column: number | null;
}

interface Range {
    start: number | null;
    end: number | null;
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