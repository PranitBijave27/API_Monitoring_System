const {
    registerOrganization,
    loginUser
} = require("../services/auth.service");


async function register(req, res) {
    try {
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
    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === "23505") {
            if (error.constraint === "organizations_name_key") {
                return res.status(409).json({
                    message: "Organization name already exists"
                });
            }

            if (error.constraint === "users_email_key") {
                return res.status(409).json({
                    message: "Email already exists"
                });
            }
        }

        res.status(500).json({
            message: "Failed to register organization"
        });
    }

}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const result = await loginUser(
            email,
            password
        );

        res.status(200).json({
            message: "Login successful",
            data: result
        });
    } catch (error) {
        console.error("Login error:", error);

        if (error.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.status(500).json({
            message: "Failed to login"
        });
    }
}

module.exports = {
    register,
    login,
};