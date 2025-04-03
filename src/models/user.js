const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        maxLength: 100
    },
    lastName: {
        type: String,
        required: true,
        maxLength: 100
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
        maxLength: 100,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email address: " + value)
            }
        }
    },
    password: {
        type: String,
        required: true,
        maxLength: 100
    },
    dateOfBirth: {
        type: Date,

    },
    gender: {
        type: String,
        validate: {
            validator: function(value) {
                const validGenders = ['male', 'female'];
                return validGenders.includes(value);
            },
            message: "Gender is not valid"
        }
    },
    photoUrl: {
        type: String,
        default: 'http://xyz.com'
    },
    skills: {
        type: [String],
        validate: {
            validator: function(value) {
                return value.length <= 3;
            },
            message: "skills cannot be more than 3"
        }
    }
},
{
    timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;