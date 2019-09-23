'use strict';

import express from 'express';
import DeviceService from './device-service';

let router = express.Router();

const baseHandler = async (promise, res) => {
    return promise.then((data) => {
        if (data) {
            res.status(200).send(data);
        } else {
            res.sendStatus(200);
        }
    }, (error) => {
        console.error('Request rejected: ', error);
        res.status(500).send(error.message);
    });
};

router.get('/list', async (req, res) => {
    baseHandler(DeviceService.getDevicesList(), res);
});

router.get('/open/:device', async (req, res) => {
    console.debug('Open device: ', req.params.device);
    baseHandler(DeviceService.openDevice(req.params.device)
        .then((data) => {
            console.log(`${req.params.device} is opened succesfully`);
            return data;
        }), res);
});

router.get('/close/:device', async (req, res) => {
    console.debug('Close device: ', req.params.device);
    baseHandler(DeviceService.closeDevice(req.params.device), res);
});

router.get('/info/:device', async (req, res) => {
    console.debug('Get info: ', req.params.device);
    baseHandler(DeviceService.getDeviceInfo(req.params.device), res);
});

router.post('/config/:device', async (req, res) => {
    console.debug('Set config ' + req.params.device + ': ', req.body);
    baseHandler(DeviceService.setDeviceConfig(req.params.device, req.body), res);
});

router.get('/data/:device', async (req, res) => {
    console.debug('Get device data: ', req.params.device);
    baseHandler(DeviceService.getDeviceData(req.params.device), res);
});

module.exports = router;