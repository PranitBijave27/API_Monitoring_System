const express = require("express");

const {
    getIncidentHistory,
    getAllIncidents
} = require("../controllers/incident.controller");

const router = express.Router();

router.get(
    "/monitors/:monitorId/incidents",
    getIncidentHistory
);
router.get(
    "/incidents",
    getAllIncidents
);

module.exports = router;