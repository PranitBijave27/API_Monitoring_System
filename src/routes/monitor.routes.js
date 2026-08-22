const express = require("express");

const monitorController = require(
    "../controllers/monitor.controller"
);
const router = express.Router({ mergeParams: true });

router.post(
    "/",
    monitorController.createMonitor
);

router.get(
    "/",
    monitorController.getMonitors
);

module.exports = router;