const { getHealthChecksByMonitorId, } = require("../services/health-check-result.service");

async function getHealthCheckHistory(req, res) {
    try {
        const { monitorId } = req.params;

        const healthChecks =
            await getHealthChecksByMonitorId(monitorId);

        res.status(200).json({
            healthChecks,
        });
    } catch (error) {
        console.error("Failed to fetch health check history:",
            error.message);

        res.status(500).json({
            message: "Failed to fetch health check history",
        });
    }
}
module.exports = {
    getHealthCheckHistory,
};