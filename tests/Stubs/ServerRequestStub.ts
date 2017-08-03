import * as http from "http";
import * as net from "net"
import * as stream from "stream"

export default class ServerResponseStub extends stream.Readable implements http.ServerRequest
{
    connection: net.Socket;

    httpVersion: string;
    httpVersionMajor: number;
    httpVersionMinor: number;
    headers: any;
    rawHeaders: string[];
    trailers: any;
    rawTrailers: any;
    setTimeout(msecs: number, callback: Function): NodeJS.Timer { return new TimerStub(); };
    method?: string;
    url?: string;
    statusCode?: number;
    statusMessage?: string;
    socket: net.Socket;
    destroy(error?: Error): void { };
}

class TimerStub implements NodeJS.Timer
{
    ref(): void { };
    unref(): void { };
}