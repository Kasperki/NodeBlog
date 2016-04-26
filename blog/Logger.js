var fs = require('fs');
var config = require('../config.js');

//Do we write logs to disk
var writeLogs = config.log.print;

//Do we print logs to console
var printLogs = config.log.write;

//All possible logging levels
const loggingLevels = 
{
    "DEBUG" : 1,
    "WARNING" : 2,
    "ERROR" : 4,
    "ALL" : 7
}

//Current logging level
var loggingLevel = loggingLevels.ALL;

var Debug = function (path, message) 
{
    if (isLoggingLevelTrue(loggingLevels.DEBUG)) {
        Log(path, message, loggingLevels.DEBUG);
    }
};

var Warning = function (path, message) 
{
    if (isLoggingLevelTrue(loggingLevels.WARNING)) {
        Log(path, message, loggingLevels.WARNING);
    }
};

var Error = function (path, message) 
{
    if (isLoggingLevelTrue(loggingLevels.ERROR)) {
        Log(path, message, loggingLevels.ERROR);
    }
};

var Log = function (path, message, level) 
{
    var log = formatLogMessage(message, level);
    
    if (printLogs) {
        console.log("\n" + log);
    }
    
    if (writeLogs) {    
        try {
            fs.writeFileSync(path, log,  { encoding: "utf-8", flag: "a"});
        }
        catch (e) {
            console.log("Can't log: " + path + " does not exists");
        }
    }    
}

function isLoggingLevelTrue(level)
{
    return (loggingLevel & level) == level;
}

function formatLogMessage(message, level)
{
    var log = "[" + new Date() + "] -- " + getLogLevelName(level) + message + "\n";
    return log;
}

function getLogLevelName(level) 
{
    if (typeof level === 'undefined' || !level) {
        return "";
    }
    
    for (var name in loggingLevels) {
        if (loggingLevels[name] == level) {
            return name + " :: ";
        }
    }
}

module.exports = {
    Debug : Debug,
    Warning : Warning, 
    Error : Error,
    Log : Log
}