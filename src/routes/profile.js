const express = require("express");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const { ValidationError } = require("../errors/error");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

profileRouter.get("/view", userAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        res.send(user);
    } catch (err) {
        next(err);
    }
});

profileRouter.patch("/edit", userAuth, async (req, res, next) => {
    try {
        validateEditProfileData(req);
        const updatedUser = await User.findByIdAndUpdate(req.userId, {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dateOfBirth: req.body.dateOfBirth,
            gender: req.body.gender,
            skills: req.body.skills
        }, {
            runValidators: true,
            returnDocument: "after"
        });

        res.json({
            message: "Profile updated successfully",
            data: updatedUser
        });
    } catch (err) {
        next(err);
    }
});

profileRouter.patch("/change-password", userAuth, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);

        if (!await user.isValidPassword(currentPassword)) {
            throw new ValidationError("Current password is not correct");
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        user.password = newPasswordHash;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch(err) {
        next(err);
    }
});

module.exports = profileRouter;