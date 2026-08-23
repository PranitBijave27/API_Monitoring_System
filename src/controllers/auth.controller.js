const {
    registerOrganization
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

module.exports = {
    register
};