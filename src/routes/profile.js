const express = require("express");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const { errorHandler } = require("../middlewares/error");
const { validateEditProfileData } = require("../utils/validation");

const profileRouter = express.Router();

profileRouter.get("/view", userAuth, async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        res.send(user);
    } catch (err) {
        next(err);
    }
}, errorHandler);

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
}, errorHandler);

module.exports = profileRouter;