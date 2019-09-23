import Api from './api';

const port = 8080;

class App {
    constructor() {
        this.api = new Api(port);
    }

    start = async () => {
        await this.api.start().then(() => console.log(`App started on port ${port}.`));
    };
}

const app = new App();
app.start();
