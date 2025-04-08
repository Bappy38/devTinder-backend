const validator = require("validator");
const { ValidationError } = require("../errors/error");

const validateSignUpData = (req) => {

    const { email, password } = req.body;
    const minPasswordLength = 8;
    const maxPasswordLength = 100;

    if (!validator.isEmail(email)) {
        throw new ValidationError("Email is not valid", "email", email);
    }
    else if (password.length < minPasswordLength || password.length > maxPasswordLength) {
        throw new ValidationError(`Password length must be within [${minPasswordLength}, ${maxPasswordLength}]`);
    }
    else if (!validator.isStrongPassword(password)) {
        throw new ValidationError("Not a strong password", "password", password);
    }
};

const validateEditProfileData = (req) => {

    const allowedFields = [ 'firstName', 'lastName', 'dateOfBirth', 'gender', 'skills' ];
    const isValidEditProfileRequest = Object.keys(req.body).every((field) => allowedFields.includes(field));

    if (!isValidEditProfileRequest) {
        throw new ValidationError("Edit Profile Request Is Not Valid");
    }
}

const validateSendConnectionRequestData = (req) => {
    
    const fromUserId = req.userId;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const allowedStatus = ["interested", "ignored"];
    if (!allowedStatus.includes(status)) {
        throw new ValidationError("Invalid status type");
    }
}

const validateReviewConnectionRequestData = (req) => {

    const status = req.params.status;
    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
        throw new ValidationError("Invalid status type");
    }
}

module.exports = {
    validateSignUpData,
    validateEditProfileData,
    validateSendConnectionRequestData,
    validateReviewConnectionRequestData
};