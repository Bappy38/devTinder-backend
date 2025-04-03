const validator = require("validator");
const ValidationError = require("../errors/ValidationError");

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

module.exports = {
    validateSignUpData
}