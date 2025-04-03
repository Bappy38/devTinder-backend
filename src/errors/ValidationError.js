class ValidationError extends Error {
    constructor(message, field = null, value = null) {
        super(message);

        this.name = "ValidationError";
        this.statusCode = 400;
        this.field = field;
        this.value = value;
    }
}

module.exports = ValidationError;