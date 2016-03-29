import * as colors from 'cli-color';
import * as moment from 'moment';
import * as Enumerable from 'linq';

type WriteStream = {
    write(text: string): void;
};

export const Levels = {
    Trace: 'trace',
    Debug: 'debug',
    Log: 'log',
    Info: 'info',
    Warn: 'warn',
    Error: 'error'
};

export const AllLevels = [Levels.Trace, Levels.Debug, Levels.Log, Levels.Info, Levels.Warn, Levels.Error];
export const DevLevels = AllLevels;
export const ProdLevels = [Levels.Log, Levels.Info, Levels.Warn, Levels.Error];

export let LogColors = {
    'trace': colors.white,
    'debug': colors.white,
    'log': colors.whiteBright,
    'info': colors.cyan,
    'warn': colors.yellow,
    'error': colors.red,
    'namespace': colors.green.bold,
    'timestamp': colors.green.bold,
};

function colorize(color: string, text: string): string {
    if (!LogColors[color]) {
        throw new Error(`Missing color def for ${color}`);
    }

    return LogColors[color](text);
}

export class Logger {
    static defaultLevels  = {
        dev: DevLevels,
        prod: ProdLevels
    };
    static env = 'dev';

    private enabledLevels: {[level: string]: boolean;} = {};
    private logNamespace: string = null;

    constructor(levels?: string[]) {
        levels = !levels || !levels.length ? Logger.defaultLevels[Logger.env] : levels;
        for(let level of levels)
        {
            this.enabledLevels[level] = true;
        }
    }

    namespace(name: string): Logger {
        let levels = Enumerable
            .from(this.enabledLevels)
            .select(x => x.key)
            .toArray();
        let logger = new Logger(levels);
        logger.logNamespace = name;
        return logger;
    }

    trace(...args: any[]): void {
        this.logTo(console.log, Levels.Trace, args);
    }

    debug(...args: any[]): void {
        this.logTo(console.log, Levels.Debug, args);
    }

    log(...args: any[]): void {
        this.logTo(console.log, Levels.Log, args);
    }

    info(...args: any[]): void {
        this.logTo(console.info, Levels.Info, args);
    }

    warn(...args: any[]): void {
        this.logTo(console.warn, Levels.Warn, args);
    }

    error(...args: any[]): void {
        this.logTo(console.error, Levels.Error, args);
    }

    toStream(level: string = Levels.Log): WriteStream {
        if(typeof this[level] !== 'function') {
            throw new Error(`Invalid level: ${level}`);
        }

        let logFunc = this[level].bind(this);
        return { write: logFunc };
    }

    private logTo(logFunc: Function, level: string, args: any[]): void {
        if (!this.enabledLevels[level]) {
            return;
        }

        let coloredArgs = args.map(arg => typeof arg === 'string' ? colorize(level, arg) : arg);
        let timestampText = moment().format('MM-DD-YYYY HH:mm:ss.SSS');
        let timestamp = colorize('timestamp', `[${timestampText}]`);
        let logNamespace = this.logNamespace ?  colorize('namespace', `[${this.logNamespace}]`) : null;
        let levelName = colorize(level, `[${level.toUpperCase()}]`);

        if (logNamespace) {
            logFunc.call(console, timestamp, logNamespace, levelName, ...coloredArgs);
        } else {
            logFunc.call(console, timestamp, levelName, ...coloredArgs);
        }
    }
}

export let logger = new Logger();