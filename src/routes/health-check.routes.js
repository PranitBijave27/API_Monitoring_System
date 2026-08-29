const express = require("express");
const { getHealthCheckHistory,getMonitorStatsController } = require("../controllers/health-check.controller");
const { authenticate, } = require("../middleware/auth.middleware");
const router = express.Router({ mergeParams: true });

router.get(
    "/monitors/:monitorId/health-checks",
    authenticate,
    getHealthCheckHistory
);
router.get(
    "/monitors/:monitorId/stats",
    authenticate,
    getMonitorStatsController    
);

module.exports = router;