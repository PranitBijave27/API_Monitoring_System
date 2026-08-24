const userService = require("../services/user.service");
const asyncHandler = require("../utils/async-handler");
const AppError = require("../utils/app-error");


const createMember = asyncHandler(
    async (req, res) => {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            throw new AppError("Name, email and password are required", 400);
        }

        const user = await userService.createMember(
            req.user.organizationId,
            name,
            email,
            password
        );

        return res.status(201).json({
            message: "Member created successfully",
            data: user
        });
    }
);

module.exports = {
    createMember
};