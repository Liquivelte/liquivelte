export interface Forloop {
    index: number;
    index0: number;
    rindex: number;
    rindex0: number;
    first: boolean;
    last: boolean;
    length: number;
    parentloop?: Forloop;
}
export declare function createForloop(index0: number, length: number, parentloop?: Forloop): Forloop;
