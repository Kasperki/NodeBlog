"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream = require("stream");
class ServerResponseStub extends stream.Readable {
    setTimeout(msecs, callback) { return new TimerStub(); }
    ;
    destroy(error) { }
    ;
}
exports.default = ServerResponseStub;
class TimerStub {
    ref() { }
    ;
    unref() { }
    ;
}
