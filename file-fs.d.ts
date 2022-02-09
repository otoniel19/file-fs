export function config(directory: any, root: any, hidden: any, lock: any, url: any): void;
export function getInfo(): {
    url: string;
    fullUrl: any;
    dirObj: any[];
    cd: typeof cd;
    root: string;
    currentDir: string;
    lockRootDir: boolean;
    showHiddenFiles: boolean;
};
declare function cd(): Promise<string[]>;
export const router: import("express-serve-static-core").Router;
export {};
