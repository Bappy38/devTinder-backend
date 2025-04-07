const validator = require("validator");
const { ValidationError } = require("../errors/error");

const validateSignUpData = (req) => {

    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName) {
        throw new ValidationError("Name is not valid!");
    } else if (!validator.isEmail(email)) {
        throw new ValidationError("Email is not valid!", "email", email);
    } else if (!validator.isStrongPassword(password)) {
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

module.exports = {
    validateSignUpData,
    validateEditProfileData
};