class ValidationError extends Error {
    constructor(message, field = null, value = null) {
        super(message);

        this.name = "HandledError";
        this.statusCode = 400;
        this.field = field;
        this.value = value;
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);

        this.name = "HandledError";
        this.statusCode = 404;
    }
}

module.exports = {
    ValidationError,
    NotFoundError
};