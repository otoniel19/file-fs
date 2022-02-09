export function config(directory: any, root: any, hidden: any, lock: any, url: any): void;
export function getInfo(): {
    url: any;
    dirObj: any[];
    cd: typeof cd;
    root: string;
    currentDir: string;
    lockRootDir: boolean;
    showHiddenFiles: boolean;
};
declare function cd(): Promise<any>;
export const router: any;
export {};
