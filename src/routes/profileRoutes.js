const express = require("express");
const User = require("../models/user");
const { validateEditProfileData } = require("../utils/validation");
const { ValidationError } = require("../errors/error");
const bcrypt = require("bcrypt");
const { userPublicFields } = require("../constants/projections");
const { sendSuccessResponse } = require("../utils/response");

const profileRouter = express.Router();

profileRouter.get("/view", async (req, res, next) => {
    try {
        const user = await User
            .findById(req.userId)
            .select(userPublicFields);

        sendSuccessResponse(res, {
            message: "Profile fetched successfully",
            data: user
        });
    } catch (err) {
        next(err);
    }
});

profileRouter.patch("/edit", async (req, res, next) => {
    try {
        validateEditProfileData(req);
        const updatedUser = await User.findByIdAndUpdate(req.userId, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            about: req.body.about,
            dateOfBirth: req.body.dateOfBirth,
            gender: req.body.gender,
            photoUrl: req.body.photoUrl,
            skills: req.body.skills
        }, {
            runValidators: true,
            returnDocument: "after"
        });

        sendSuccessResponse(res, {
            message: "Profile updated successfully",
            data: updatedUser
        });
    } catch (err) {
        next(err);
    }
});

profileRouter.patch("/change-password", async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);

        if (!await user.isValidPassword(currentPassword)) {
            throw new ValidationError("Current password is not correct");
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        user.password = newPasswordHash;
        await user.save();

        sendSuccessResponse(res, {
            message: "Password changed successfully"
        });
    } catch(err) {
        next(err);
    }
});

module.exports = profileRouter;