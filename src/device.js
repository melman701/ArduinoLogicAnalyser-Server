import serialport from 'serialport';
import readline from '@serialport/parser-readline';
import {Deferred, TimeoutPromise} from './lib';

'use strict';

const portConfiguration = {
    autoOpen: false,
    baudRate: 115200,
    dataBits: 8,
    parity: 'none'
};

const command = Object.freeze({
    INFO: 1,
    CONFIG: 2,
    DATA: 3
});

let instance = null;

class Device {
    constructor(onDataCallback) {
        if (!instance) {
            instance = this;
        }

        this.ports = [];
        this.parsers = [];
        this.dataDeferred = [];
        this.onDataCallback = onDataCallback;

        return instance;
    }

    static getDevicesList = async () => {
        let devices = [];
        await serialport.list((error, ports) => {
            if (error) {
                Promise.reject(new Error(error));
            } else {
                ports.forEach(port => {
                    devices.push(port.comName);
                });
            }
        });

        return devices;
    };

    open = async (device) => {
        this.ports[device] = new serialport(device, portConfiguration);
        this.parsers[device] = new readline({delimeter: '\r'});
        let dev = this.ports[device];
        let parser = this.parsers[device];
        dev.pipe(parser);

        dev.on('error', (error) => this._onError(error, device));
        parser.on('data', (data) => this._onData(data, device));

        let promise = new Promise((resolve, reject) => {
            dev.open((err) => {
                if (err) {
                    reject(err);
                }
            });

            dev.on('open', () => {
                resolve();
            });
        });
        return promise;
    };

    close = async (device) => {
        return new Promise((resolve, reject) => {
            if (!this.ports[device]){
                return resolve();
            }

            this.ports[device].close((error) => {
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
    };

    getInfo = async (device) => {
        let data = JSON.stringify({cmd: command.INFO});
        console.log(data);
        return await this._write(device, data).then(() => {
            return this._waitForResponse(device);
        });
    };

    setConfig = async (device, config) => {
        let dataObj = {};
        dataObj = Object.assign(dataObj, config, {cmd: command.CONFIG});
        let data = JSON.stringify(dataObj);
        console.log(data);
        return await this._write(device, data).then(() => {
            return this._waitForResponse(device);
        });
    };

    _onData = async (data, device) => {
        //console.debug('New data: ', data);
        let dataObj = JSON.parse(data);
        let deferred = this.dataDeferred[device];
        if ((dataObj.type === 'info' || dataObj.type === 'config') 
            && deferred) {
            deferred.resolve(dataObj);
        } else if (dataObj.type === 'data' && this.onDataCallback) {
            let dataCopy = { ...dataObj };
            delete dataCopy.type;
            this.onDataCallback(device, JSON.stringify(dataCopy));
        }
    };

    _onError = async (error, device) => {
        console.error(error);
        let deferred = this.dataDeferred[device];
        if (deferred) {
            deferred.reject(error);
        } else {
            throw error;
        }
    };

    _write = async (device, data) => {
        return new Promise((resolve, reject) => {
            let dev = this.ports[device];
            if (!dev?.isOpen) {
                return reject(new Error('Device is not opened'));
            }

            dev.write(data, 'utf8', (error) => {
                if (error) {
                    reject(error);
                }
            });
            dev.drain((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    };

    _waitForResponse = async (device) => {
        this.dataDeferred[device] = new Deferred();
        return new TimeoutPromise((resolve, reject) => {
            return this.dataDeferred[device].promise.then((data) => {
                resolve(data);
            }, (error) => {
                reject(error);
            });
        }, 500);
    };
}

export default Device;