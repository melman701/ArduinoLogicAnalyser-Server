'use strict';

class Deferred {
    constructor() {
        this._promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        }).catch((error) => {
            if (error) {
                console.error('Error: ', error);
                this.reject(error);
            }
        });
    }

    get promise () {
        return this._promise;
    }
}

export default Deferred;