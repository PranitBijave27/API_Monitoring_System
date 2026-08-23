const {
    getIncidentsByMonitorId,
    getIncidents
} = require("../services/incident.service");
const {
    getMonitorById,
} = require("../services/monitor.service");

async function getIncidentHistory(req, res) {
    try {
        const { monitorId } = req.params;

        const monitor = await getMonitorById(
            monitorId,
            req.user.organizationId
        );
        if (!monitor) {
            return res.status(404).json({
                message: "Monitor not found"
            });
        }

        const incidents = await getIncidentsByMonitorId(monitorId);

        res.status(200).json({
            incidents
        });
    } catch (error) {
        console.error("Error fetching incident history:", error);

        res.status(500).json({
            message: "Failed to fetch incident history"
        });
    }
}

async function getAllIncidents(req, res) {
    try {
        const { status } = req.query;

        if (status &&
            !["OPEN", "RESOLVED"].includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid incident status"
            });
        }

        const incidents = await getIncidents(
            status,
            req.user.organizationId
        );

        res.status(200).json({
            incidents
        });
    } catch (error) {
        console.error("Error fetching incidents:", error);

        res.status(500).json({
            message: "Failed to fetch incidents"
        });
    }
}

module.exports = {
    getIncidentHistory,
    getAllIncidents
};