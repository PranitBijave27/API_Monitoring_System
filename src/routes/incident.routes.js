const express = require("express");

const {
    getIncidentHistory,
    getAllIncidents
} = require("../controllers/incident.controller");
const {
    authenticate,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
    "/monitors/:monitorId/incidents",
    authenticate,
    getIncidentHistory
);
router.get(
    "/incidents",
    authenticate,
    getAllIncidents
);

module.exports = router;