const errorHandler = async (err, req, res, next) => {

    console.error("Error: ", err.stack || err.message || err);

    let statusCode = 500;
    let message = "Internal Server Error";

    if (err.name === 'HandledError') {
        statusCode = err.statusCode;
        message = err.message
    } else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    } else if (err.name === 'MongoServerError' && err.code === 11000) {
        statusCode = 409;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        error: message
    });
};

module.exports = {
    errorHandler
};