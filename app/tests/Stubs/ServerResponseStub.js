"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream = require("stream");
class ServerResponseStub extends stream.Writable {
    constructor() {
        super(...arguments);
        this.headers = {};
        this.writeContinue = () => { };
        this.setHeader = (name, value) => {
            if (typeof value === 'string') {
                this.headers[name] = value;
            }
            else {
                this.headers[name] = [];
                for (let i in value) {
                    this.headers[name][i] = value[i];
                }
            }
        };
        this.setTimeout = (msecs, callback) => { return new ServerResponseStub(); };
        this.getHeader = (name) => { return this.headers[name]; };
        this.removeHeader = (name) => { };
        this.addTrailers = (headers) => { };
    }
    write(chunk, encoding) { if (typeof (chunk) === "string")
        this.data = chunk; }
    ;
    writeHead(statusCode, reasonPhrase, headers) {
        this.statusCode = statusCode;
        for (var i in reasonPhrase) {
            this.setHeader(i, reasonPhrase[i]);
        }
    }
    ;
    end(str, buffer, data, encoding, cb) { }
    ;
    getData() { return this.data; }
    getHeaders() { return this.headers; }
}
exports.default = ServerResponseStub;
