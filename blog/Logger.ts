import * as fs from "fs";
import * as config from "../config";

enum LogLevel
{
    DEBUG = 1,
    WARNING = 2,
    ERROR = 4,
    ALL = 7
}

export function AccessLogger(): Logger
{
    return new Logger(config.log.access);
}

export function ErrorLogger(): Logger
{
    return new Logger(config.log.error);
}

class Logger
{
    private writeLogs: boolean;
    private printLogs: boolean;
    private loggingLevel: number;
    private path: string;

    constructor(path: string)
    {
        //Do we write logs to disk
        this.writeLogs = config.log.print;

        //Do we print logs to console
        this. printLogs = config.log.write;

        //Current logging level
        this.loggingLevel = config.log.level;

        this.path = path;
    }

    Debug = (message: string): void =>
    {
        if (this.IsLoggingLevelTrue(LogLevel.DEBUG))
        {
            this.LogTo(message, LogLevel.DEBUG);
        }
    }
    
    Warning = (message: string): void =>
    {
        if (this.IsLoggingLevelTrue(LogLevel.WARNING))
        {
            this.LogTo(message, LogLevel.WARNING);
        }
    }

    Error = (message: string): void =>
    {
        if (this.IsLoggingLevelTrue(LogLevel.ERROR))
        {
            this.LogTo(message, LogLevel.ERROR);
        }
    }

    Log = (message: string): void =>
    {
        this.LogTo(message, LogLevel.ALL);
    }

    private LogTo = (message: string, level: LogLevel): void =>
    {
        let log = this.FormatLogMessage(message, level);

        if (this.printLogs)
        {
            console.trace("\n" + log);
        }

        if (this.writeLogs)
        {
            try
            {
                fs.writeFileSync(this.path, log, { encoding: "utf-8", flag: "a" });
            }
            catch (e)
            {
                console.log("Can't log: " + this.path + " does not exists" + e);
            }
        }
    }

    private IsLoggingLevelTrue = (level: LogLevel): boolean =>
    {
        return (this.loggingLevel & level) === level;
    }

    private FormatLogMessage = (message: string, level: LogLevel): string =>
    {
        return "[" + new Date() + "] -- " + LogLevel[level] + " :: " + message + "\n";
    }
}