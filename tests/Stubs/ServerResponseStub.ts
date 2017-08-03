import * as http from "http";
import * as stream from "stream"
import { IDictionary } from "../../blog/Infastructure/Dictionary";

export default class ServerResponseStub extends stream.Writable implements http.ServerResponse
{
    sendDate: boolean;
    finished: boolean;
    statusCode: number;
    statusMessage: string;
    headersSent: boolean;
    headers: any = {};
    private data: string;

    write(buffer: Buffer): boolean;
    write(buffer: Buffer, cb?: Function): boolean;
    write(str: string, cb?: Function): boolean;
    write(str: string, encoding?: string, cb?: Function): boolean;
    write(str: string, encoding?: string, fd?: string): boolean;
    write(chunk: any, encoding?: any): any { if (typeof (chunk) === "string") this.data = chunk; };

    writeContinue = (): void => { };
    writeHead(statusCode: number, headers?: any): void;
    writeHead(statusCode: number, reasonPhrase?: string, headers?: any)
    {
        this.statusCode = statusCode;
    };

    setHeader = (name: string, value: string | string[]): void =>
    {
        if (typeof value === 'string')
        {
            this.headers[name] = value;
        }
        else
        {
            this.headers[name] = [];

            for (let i in value)
            {
                this.headers.name[i] = value[i];
            }
        }
    };

    setTimeout = (msecs: number, callback: Function): http.ServerResponse => { return new ServerResponseStub() };
    getHeader = (name: string): string => { return this.headers[name]; };
    removeHeader = (name: string): void => { };
    addTrailers = (headers: any): void => { };

    end(): void;
    end(buffer: Buffer, cb?: Function): void;
    end(str: string, cb?: Function): void;
    end(str: string, encoding?: string, cb?: Function): void;
    end(str?: any, buffer?: any, data?: any, encoding?: string, cb?: Function): void { };

    getData(): string { return this.data; }
    getHeaders(): any { return this.headers; }
}