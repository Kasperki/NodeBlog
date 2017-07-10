"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpResponseStub {
    constructor() {
        // Extended base methods
        this.write = (buffer) => { return true; };
        //write1 = (buffer: Buffer, cb?: Function): boolean => { return true; };
        //write2 = (str: string, cb?: Function): boolean => { return true; };
        //write3 = (str: string, encoding?: string, cb?: Function): boolean => { return true; };
        //write4 = (str: string, encoding?: string, fd?: string): boolean => { return true; };
        this.writeContinue = () => { };
    }
}
{ }
;
removeHeader(name, string);
void ;
write(chunk, any, encoding ?  : string);
any;
addTrailers(headers, any);
void ;
finished: boolean;
// Extended base methods
end();
void ;
end(buffer, Buffer, cb ?  : Function);
void ;
end(str, string, cb ?  : Function);
void ;
end(str, string, encoding ?  : string, cb ?  : Function);
void ;
end(data ?  : any, encoding ?  : string);
void ;
