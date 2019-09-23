import fs from 'fs';
import { isNullOrUndefined } from 'util';

'use strict';

class DumpHandler {
    constructor(directoryPath) {
        this.path = directoryPath;
        this.fileHandles = [];
    }

    startNew = async (device) => {
        let dateToString = (date) => {
            let pad = (number) => {
                if (number < 10) {
                    return '0' + number;
                }
                return number;
            }
    
            return date.getUTCFullYear() +
                '-' + pad(date.getUTCMonth() + 1) +
                '-' + pad(date.getUTCDate()) +
                'T' + pad(date.getUTCHours()) +
                '-' + pad(date.getUTCMinutes()) +
                '-' + pad(date.getUTCSeconds()) +
                '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
                'Z';
        };

        let now = dateToString(new Date(Date.now()));
        let fileName = `${now}_${device}`;
        let filePath = `${this.path}/${fileName}`;
        console.debug(`Open file ${filePath}`);
        return fs.promises.open(filePath, 'a').then((fileHandle) => {
            this.fileHandles[device] = fileHandle;
        });
    };

    stop = async (device) => {
        let handle = this.fileHandles[device];
        this.fileHandles[device] = null;
        return handle?.close();
    };

    push = async (device, data) => {
        return this.fileHandles[device]?.write(`${data}\r\n`);
    };

    isInProgress = (device) => {
        return !isNullOrUndefined(this.fileHandles[device]);
    };
}

export default DumpHandler;