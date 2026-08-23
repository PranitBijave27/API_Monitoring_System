const express = require("express");

const monitorController = require(
    "../controllers/monitor.controller"
);
const {
    authenticate,
} = require("../middleware/auth.middleware");

const router = express.Router({ mergeParams: true });

router.post(
    "/",
    authenticate,
    monitorController.createMonitor
);

router.get(
    "/",
    authenticate,
    monitorController.getMonitors
);

module.exports = router;