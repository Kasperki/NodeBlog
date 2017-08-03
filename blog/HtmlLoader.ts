import * as fs from "fs";
import * as config from "../config";
import { ErrorLogger } from "./Logger";
import { RequestData } from "./BaseController";
import * as Minify from "./Templating/MinifyFiles";

/**
 *  Loads html file with twig like functionality
 *  @param RequestInfo requestInfo
 *  @param String .html filepath
 *  @param array parameters (key:value)
 *  @param int code = 200 [Optional]
 *  @param function callback(error, boolean) [Optional]
 */
export function load(requestInfo: RequestData, file: string, parameters: any, code: number = 200)
{
    fs.readFile(config.__views + file, "utf-8", function (err, html)
    {
        if (err)
        {
            throw err;
        }

        if (parameters != null)
        {
            for (let attrname in requestInfo.parameters) { parameters[attrname] = requestInfo.parameters[attrname]; }
        }
        else
        {
            parameters = requestInfo.parameters;
        }

        html = replaceParameters(html, parameters);
        html = extendHtmlFile(html, parameters);
        html = TemplateIf(html);
        html = combineFiles(html);

        requestInfo.response.writeHead(code, { "Content-Type": "text/html" });
        requestInfo.response.write(html);
        requestInfo.response.end();
    });
}

/**
 * Replace string in html file
 * Usage: {{ valueToBeReplaced }}
 *  @param string html
 *  @param array parameters [key:value]
 *  return string
 */
export function replaceParameters (html: string, parameters: any)
{
    for (let key in parameters)
    {
        let regex = new RegExp("{{\\s*" + key + "\\s*}}", "g");
        html = html.replace(regex, parameters[key]);
    }

    return html;
}

/**
 * Extend html file
 * Usage: {% extend path/to/file.html %}
 * @param string html
 * @param array parameters [key:value]
 * return string
 */
export function extendHtmlFile(html: string, parameters: any)
{
    const keyword = "extends";

    let regex = new RegExp("{%\\s*" + keyword + "\\s*[A-Za-z0-9\"/().-]*\\s*%}", "g");
    let regexMatch = html.match(regex);

    if (regexMatch == null)
    {
        return html;
    }

    for (let i = 0; i < regexMatch.length; i++)
    {
        let startIndex = regexMatch[i].search(keyword) + keyword.length;
        let filePath = regexMatch[i].substr(startIndex, regexMatch[i].length - 2 - startIndex).trim();

        try
        {
            console.log(config.__views + filePath);

            let includingFile = fs.readFileSync(config.__views + filePath, "utf-8");
            includingFile = replaceParameters(includingFile, parameters);
            includingFile = TemplateIf(includingFile);
            html = html.replace(new RegExp(regexMatch[i], "g"), includingFile);
        }
        catch (e)
        {
            ErrorLogger().Error(config.__views + " No such file:" + filePath + " " + e);
            html = html.replace(new RegExp(regexMatch[i]), "");
        }
    }

    return html;
}

/**
 * Combines files together
 * Usage: {% stylesheet output="path/to/outputFile.css" "path/to/inputFileX.html" "path/to/inputFileY.html" "path/to/inputFileZ.html"... %}
 * @param String html
 * return string
 */
export function combineFiles (html: string)
{
    let regex = new RegExp("{%\\s*stylesheet\\s*[A-Za-z0-9\"/().=-\\s*]*\\s*%}", "g");
    let regexMatch = html.match(regex);

    if (regexMatch == null)
        return html;

    for (let i = 0; i < regexMatch.length; i++)
    {

        let regexOutput = new RegExp("output=\"(.*?)\"");
        let output = regexMatch[i].match(regexOutput);
        let outputFile = "";

        //Check does the string have output="" argument
        if (output != null && output.length > 0) {
            outputFile = config.cache.path + output[1];
        }
        else
        {
            html = html.replace(new RegExp(regexMatch[i]), "");
            ErrorLogger().Debug("combineFiles() :: Missing output argument");
            continue;
        }

        //Check if file exists. Always combine in dev build.
        if (config.env != "dev")
        {
            try
            {
                fs.accessSync(outputFile, fs.constants.F_OK);
                html = html.replace(new RegExp(regexMatch[i]), "");
                continue; //File already in cache, skip combining.
            }
            catch (e)
            {
                ErrorLogger().Debug("combineFiles() :: File " + outputFile + " not found... combining...");
            }
        }
        else
        {
            try
            {
                fs.unlinkSync(outputFile);
            }
            catch (e) { }
        }

        let regexFiles = new RegExp('\"(.*?)\"', "g");
        let inputFiles = [];

        let match; let first = true;
        while ((match = regexFiles.exec(regexMatch[i])) != null) {
            if (!first) {
                inputFiles.push(config.__base + match[1]);
            }

            first = false;
        }

        //Combine Files....
        Minify.CombineFiles(outputFile, inputFiles);

        //Minify
        if (outputFile.endsWith(".css"))
        {
            Minify.MinifyCSS(outputFile);
        }

        if (outputFile.endsWith(".js"))
        {
            Minify.MinifyJS(outputFile);
        }

        html = html.replace(new RegExp(regexMatch[i]), "");
    }

    return html;
}


export function TemplateIf (html: string)
{
    let regex = new RegExp("{%\\s*if\\s*([A-Za-z0-9\"().-]*)\\s*==\\s*([A-Za-z0-9\"().-]*)\\s*%}\\s*(.*?)\\s*{%\\s*endif\\s*%}", "g");

    let regexMatch, matchReplace = [];
    while ((regexMatch = regex.exec(html)) != null)
    {
        let var1 = regexMatch[1];
        let var2 = regexMatch[2];

        let block = regexMatch[3];

        if (var1 == var2)
        {
            matchReplace.push({ match: regexMatch[0], block: block });
        }
        else
        {
            matchReplace.push({ match: regexMatch[0], block: "" });
        }
    }

    for (let i = 0; i < matchReplace.length; i++)
    {
        html = html.replace(matchReplace[i].match, matchReplace[i].block);
    }

    return html;
}