import Device from './device';
import DumpHandler from './dump-handler';
import CircularBuffer from 'circular-buffer';

import {TimeoutPromise} from './lib';

'use strict';

class _AppWorker {
    constructor() {
        this.device = new Device(this._onDataReceived);
        this.dump = new DumpHandler('./dumps/');
        this.statuses = [];
        this.buffers = [];
    }

    getDevicesList = async () => {
        return Device.getDevicesList();
    };

    openDevice = async (device) => {
        this._clearBuffer(device);
        return this.device.open(device);
    };

    closeDevice = async (device) => {
        return this.device.close(device);
    };

    getDeviceInfo = async (device) => {
        return this.device.getInfo(device);
    };

    setDeviceConfig = async (device, config) => {
        let isEnabled = config.en;
        let isDumping = this.dump.isInProgress(device);
        console.debug(`isEnabled ${isEnabled}, isDumping ${isDumping}`);
        if (isEnabled && !isDumping) {
            await this.dump.startNew(device);
        }

        let devConfig = this._convertConfig(config);
        let result = await this.device.setConfig(device, devConfig);
        if (!isEnabled && isDumping) {
            this.dump.stop(device);
        }

        return result;
    };

    getDeviceData = async (device) => {
        return new TimeoutPromise((resolve, reject) => {
            try {
                let data = this._popAllFromBuffer(device);
                resolve(data);
            }
            catch (err) {
                reject(err);
            }
        }, 500);
    };

    _onDataReceived = (device, data) => {
        console.debug(`Data received [${device}]: ${data}`);
        this._pushToBuffer(device, data);
        this.dump.push(device, data)
            .catch((error) => console.error(`Failed to write data for device ${device}. ${error.message}`));
    };

    _pushToBuffer = (device, data) => {
        let ensureBufferCreated = (device) => {
            if (!this.buffers[device]) {
                this.buffers[device] = new CircularBuffer(1000);
            }
            return this.buffers[device];
        };

        let buffer = ensureBufferCreated(device);
        buffer.enq(data);
    };

    _popAllFromBuffer = (device) => {
        let buffer = this.buffers[device];
        let result = [];
        if (buffer) {
            while (buffer.size()) {
                result.push(buffer.deq());
            }
        }

        return result;
    };

    _convertConfig = (config) => {
        return {
            en: config.enabled ? 1 : 0,
            samples: config.samplesCount,
            chConf: config.channelsConfig.map(x => {
                return {
                    en: x.enabled ? 1 : 0,
                }}),
        }
    };

    _clearBuffer = (device) => {
        this.buffers[device] = null;
    };
}

const AppWorker = new _AppWorker();

export default AppWorker;