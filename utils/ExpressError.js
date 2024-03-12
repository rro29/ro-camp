class ExpressError extends Error {
    constructor (message, statusCode) {
        super(); //call this to call the constructor of the extended class

        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;