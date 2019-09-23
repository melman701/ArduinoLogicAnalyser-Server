import express from 'express';
import cors from 'cors';

let DeviceController = require('./device-controller');

class Api {
    constructor(port) {
        this.port = port;
        this.server = express();

        this.server.use(cors());
        this.server.use(express.json());
        this.server.use('/device', DeviceController);
    }

    start = async () => {
        return this.server.listen(this.port);
    }
}

export default Api;