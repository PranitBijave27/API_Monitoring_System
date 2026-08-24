const express = require("express");

const { createMember, } = require("../controllers/user.controller");

const { authenticate, authorize, } = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    createMember
);

module.exports = router;