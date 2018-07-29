import * as Colors from 'colors';
import {Color} from "colors";

export class Logger {

    public level: Level = Level.DEBUG;
    public title?: string;
    public titleColor?: Color;

    constructor() {
    }

    private buildLogMessage(level: string, message?: string): string {

        let title = ``;
        if (!!this.title && !!this.titleColor) {
            title += this.titleColor(`${this.title}`);
        }


        return `[${level}] [${title}] ${message}`;
    }

    // LOG
    debug(message?: any, ...optionalParams: any[]): void {

        if (this.level > Level.DEBUG) return;

        if (!message) {
            message = '';
        } else if (typeof message != 'string') {
            optionalParams.splice(0, 0, message);
            message = '';
        }

        console.debug(this.buildLogMessage(Colors.gray('DEBUG'), message), ...optionalParams);
    }

    info(message?: string, ...optionalParams: any[]): void {
        if (this.level > Level.INFO) return;
        if (!message) {
            message = '';
        } else if (typeof message != 'string') {
            optionalParams.splice(0, 0, message);
            message = '';
        }
        console.info(this.buildLogMessage('INFO', message), ...optionalParams);
    }

    log = this.info.bind(this);

    warn(message?: string, ...optionalParams: any[]): void {
        if (this.level > Level.WARN) return;
        if (!message) {
            message = '';
        } else if (typeof message != 'string') {
            optionalParams.splice(0, 0, message);
            message = '';
        }
        console.warn(this.buildLogMessage(Colors.red('WARN'), message), ...optionalParams);
    }

    error(message?: string, ...optionalParams: any[]): void {
        if (!!message && typeof message == 'string') {
            console.error(this.buildLogMessage(Colors.red('ERROR'), Colors.red(message)), ...optionalParams);
        } else {
            optionalParams.splice(0, 0, message);
            console.error(this.buildLogMessage(Colors.red('ERROR')), ...optionalParams);
        }
    }

    exception = this.error.bind(this);

    //


}

export enum Level {
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4
}

export class LogService {

    private static AVAILABLE_COLORS: Color[] = [Colors.green, Colors.blue, Colors.cyan, Colors.magenta, Colors.yellow];
    private idxLastColor: number = -1;
    private colorIt = this.mkColorIterator();

    private colorByTitle: Map<string, Color> = new Map();

    private rootLogger = this.getLogger('App');

    debug = this.rootLogger.debug.bind(this.rootLogger);
    info = this.rootLogger.info.bind(this.rootLogger);
    log = this.rootLogger.log.bind(this.rootLogger);
    warn = this.rootLogger.warn.bind(this.rootLogger);
    error = this.rootLogger.error.bind(this.rootLogger);
    exception = this.rootLogger.exception.bind(this.rootLogger);

    constructor() {
    }

    public getLogger(title?: string, level: Level = Level.DEBUG): Logger {
        let logger = new Logger();

        if (!!title) {
            logger.title = title;
            logger.level = level;
            let color = this.colorByTitle.get(title);
            if (!color) {
                color = this.colorIt.next().value;
                this.colorByTitle.set(title, color);
            }

            logger.titleColor = color;
        }

        return logger;
    }

    private* mkColorIterator(): IterableIterator<Color> {

        while (true) {
            if (this.idxLastColor >= LogService.AVAILABLE_COLORS.length) this.idxLastColor = 0;
            else this.idxLastColor++;
            yield LogService.AVAILABLE_COLORS[this.idxLastColor];
        }

    }

}