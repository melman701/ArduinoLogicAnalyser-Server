'use strict';

class TimeoutPromise extends Promise {
    constructor(callback, ms) {
        super((resolve, reject) => {
            callback(resolve, reject);
            if (ms) {
                setTimeout(() => {
                    reject(new Error('Timed out'));
                }, ms);
            }
        });
    }
}

export default TimeoutPromise;