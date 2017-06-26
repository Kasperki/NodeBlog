var fs = require('fs');
var config = require('../config.js');

enum LogLevel
{
    DEBUG = 1,
    WARNING = 2,
    ERROR = 4,
    ALL = 7
}

export class Logger
{
    private writeLogs: boolean;
    private printLogs: boolean;
    private loggingLevel: number;

    constructor()
    {
        //Do we write logs to disk
        this.writeLogs = config.log.print;

        //Do we print logs to console
        this. printLogs = config.log.write;

        //Current logging level
        this.loggingLevel = config.log.level;
    }

    Debug = (path: string, message: string): void =>
    {
        if (this.IsLoggingLevelTrue(LogLevel.DEBUG))
        {
            this.Log(path, message, LogLevel.DEBUG);
        }
    }
    
    Warning = (path: string, message: string): void =>
    {
        if (this.IsLoggingLevelTrue(LogLevel.WARNING))
        {
            this.Log(path, message, LogLevel.WARNING);
        }
    }

    Error = (path: string, message: string): void =>
    {
        if (this.IsLoggingLevelTrue(LogLevel.ERROR))
        {
            this.Log(path, message, LogLevel.ERROR);
        }
    }

    Log = (path: string, message: string, level: LogLevel): void =>
    {
        var log = this.FormatLogMessage(message, level);

        if (this.printLogs)
        {
            console.log("\n" + log);
        }

        if (this.writeLogs)
        {
            try
            {
                fs.writeFileSync(path, log, { encoding: "utf-8", flag: "a" });
            }
            catch (e)
            {
                console.log("Can't log: " + path + " does not exists" + e);
            }
        }
    }

    private IsLoggingLevelTrue(level: LogLevel): boolean
    {
        return (this.loggingLevel & level) === level;
    }

    private FormatLogMessage(message: string, level: LogLevel): string
    {
        var log = "[" + new Date() + "] -- " + level.toString() + " :: " + message + "\n";
        return log;
    }
}