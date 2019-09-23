import AppWorker from './app-worker';

'use strict';

class DeviceService {
    static getDevicesList = async () => {
        return await AppWorker.getDevicesList();
    };

    static openDevice = async (device) => {
        return await AppWorker.openDevice(device);
    };

    static closeDevice = async (device) => {
        return await AppWorker.closeDevice(device);
    };

    static getDeviceInfo = async (device) => {
        return await AppWorker.getDeviceInfo(device);
    };

    static setDeviceConfig = async (device, config) => {
        return await AppWorker.setDeviceConfig(device, config);
    };

    static getDeviceData = async (device) => {
        return await AppWorker.getDeviceData(device);
    };
}

export default DeviceService;