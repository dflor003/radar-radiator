import * as colors from 'colors/safe';

type Color = (text: string) => string;

export class Logger {
    static log(...args:any[]): void {
        console.log(...args);
    }

    static error(...args: any[]): void {

    }

    private static logTo(logFunc: Function, args: any[], color: Color): void {
        let coloredArgs = args.map(arg => typeof arg === 'string' ? color(arg) : arg);
        logFunc.apply(console, coloredArgs);
    }
}