export type ID = string
export type Location = `${string}:${string}:${string}:${string}:${string}`
export type Pid = `p${number}`
export type Fid = `f${number}`

export enum P_TYPE {
    NewPromise = 'NewPromise',
    AsyncFunction = 'AsyncFunction',
    Await = 'Await',
    PromiseThen = 'PromiseThen',
    PromiseCatch = 'PromiseCatch',
    PromiseResolve = 'PromiseResolve',
    PromiseReject = 'PromiseReject',
    PromiseAll = 'PromiseAll',
    PromiseRace = 'PromiseRace',
}

export type CoverageStatusTypeFlattened = {
    /*
        Null: invalid, should not consider in total states.
        True: covered
        False: not covered.
    */
    settle_fulfill: null | boolean,
    settle_reject: null | boolean,
    register_fulfill: null | boolean,
    register_reject: null | boolean,
    execute_fulfill: null | boolean,
    execute_reject: null | boolean
}

export type PInfo = {
    id: ID,
    location: Location,
    iid: number,
    executorFids: string[], // promises created using a constructor have this field, points to the executor function.
    refs: { id: ID, location: Location }[],
    pids: Pid[],
    links: { id: ID, location: Location }[],
    parent: Pid,
    _parents: Pid[], // For debugging purposes
    type: P_TYPE,
    _types: P_TYPE[], // For debugging purposes
    code?: string,
    settle: { fulfill: any[], reject: any[] },
    register: { fulfill: any[], reject: any[] },
    execute: { fulfill: any[], reject: any[] },
    _logs: any[], // For debugging purposes
    coverage?: CoverageStatusTypeFlattened,
}

export type PMap = { [id: string]: PInfo; }

export type FInfo = {
    iid: number,
    location: Location,
    returnVal: any,
}

export type FMap = { [id: Fid]: FInfo; }

