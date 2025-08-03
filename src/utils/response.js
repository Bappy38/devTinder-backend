function sendSuccessResponse(res, { message, data = null, status = 200 }) {
  res.status(status).json({
    success: true,
    message,
    data
  });
}

function sendErrorResponse(res, { message, status = 500 }) {
  res.status(status).json({
    success: false,
    message
  });
}

module.exports = {
  sendSuccessResponse,
  sendErrorResponse
};