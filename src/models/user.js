const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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
        maxLength: 100
    },
    password: {
        type: String,
        required: true,
        maxLength: 100
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: {
            values: ["male", "female"],
            message: `'{VALUE}' is not a valid gender`
        },
    },
    photoUrl: {
        type: String,
        default: 'http://xyz.com',
        maxLength: 100,
        validate: {
            validator: function(value) {
                return validator.isURL(value);
            },
            message: "photoUrl is not valid"
        }
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

userSchema.methods.getAccessToken = async function() {
    const user = this;

    const accessToken = await jwt.sign(
        {
            userId: user._id
        },
        process.env.SECRET_KEY,
        {
            expiresIn: process.env.TOKEN_EXPIRES_IN
        }
    );

    return accessToken;
};

userSchema.methods.isValidPassword = async function(enteredPassword) {
    const passwordHash = this.password;
    return await bcrypt.compare(enteredPassword, passwordHash);
};

const User = mongoose.model("User", userSchema);

module.exports = User;