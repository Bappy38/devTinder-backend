const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        maxLength: 55
    },
    lastName: {
        type: String,
        required: true,
        maxLength: 55
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
        maxLength: 55
    },
    password: {
        type: String,
        required: true,
        maxLength: 55
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
        type: [String]
    }
},
{
    timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;