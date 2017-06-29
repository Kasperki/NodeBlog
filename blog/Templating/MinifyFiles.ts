import * as fs from "fs";
var CleanCSS = require('clean-css');
var UglifyJS = require("uglify-js");
import { ErrorLogger } from "../Logger";

export function CombineFiles(outputFile: string, inputFiles: string[])
{
    for (let i = 0; i < inputFiles.length; i++)
    {
        try
        {
            let data = fs.readFileSync(inputFiles[i], "utf-8");
            fs.writeFileSync(outputFile, data, { encoding: "utf-8", flag: "a" });
        }
        catch (e)
        {
            ErrorLogger().Debug("MinifyFiles :: No such file:" + inputFiles[i] + " " + e);
            continue;
        }
    }
}

export function MinifyCSS (outputFile: string): string
{
    let outputFileMinified = outputFile.substr(0, outputFile.length - 3) + "min.css";

    let source = fs.readFileSync(outputFile);
    let minified = new CleanCSS().minify(source).styles;

    writeToFile(outputFileMinified, minified);
    return minified;
}

export function MinifyJS(outputFile: string): string
{
    let outputFileMinified = outputFile.substr(0, outputFile.length - 2) + "min.js";

    let result = UglifyJS.minify([outputFile]);

    writeToFile(outputFileMinified, result.code);
    return result.code;
}

function writeToFile(outputFileName: string, input: string)
{
    fs.writeFileSync(outputFileName, input, { encoding: "utf-8", flag: "w" });
}