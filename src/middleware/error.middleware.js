function errorHandler(err, req, res, next) {
    console.error(err);
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }
    if (err.code === "23505") {
        if (err.constraint === "organizations_name_key") {
            return res.status(409).json({
                message: "Organization name already exists",
            });
        }

        if (err.constraint === "users_email_key") {
            return res.status(409).json({
                message: "Email already exists",
            });
        }

        return res.status(409).json({
            message: "A record with this value already exists",
        });
    }

    // Invalid login credentials
    if (err.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({
            message: "Invalid email or password",
        });
    }

    // Unexpected errors
    return res.status(500).json({
        message: "Internal server error",
    });
}

module.exports = {
    errorHandler,
}