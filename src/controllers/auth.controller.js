const { registerOrganization, loginUser } = require("../services/auth.service");
const asyncHandler = require("../utils/async-handler");
const AppError = require("../utils/app-error");


const register = asyncHandler(
    async (req, res) => {

        const {
            organizationName,
            name,
            email,
            password
        } = req.body;

        const result = await registerOrganization(
            organizationName,
            name,
            email,
            password
        );
        res.status(201).json({
            message: "Organization registered successfully",
            data: result
        });
    }
);

const login = asyncHandler(
    async (req, res) => {

        const { email, password } = req.body;

        if (!email || !password) {
            throw new AppError("Email and password are required", 400);
        }

        const result = await loginUser(
            email,
            password
        );

        res.status(200).json({
            message: "Login successful",
            data: result
        });
    }
);

module.exports = {
    register,
    login,
};