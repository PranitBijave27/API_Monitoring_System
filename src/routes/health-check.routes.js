const express = require("express");
const { getHealthCheckHistory, } = require("../controllers/health-check.controller");
const router = express.Router({ mergeParams: true });

router.get(
    "/monitors/:monitorId/health-checks",
    getHealthCheckHistory
);


module.exports = router;