const userService = require(
    "../services/user.service"
);

async function createMember(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
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
    } catch (error) {
        console.error("Create member error:", error);

        if (error.code === "23505" &&
            error.constraint === "users_email_key"
        ) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    createMember
};