const { getHealthChecksByMonitorId, } = require("../services/health-check-result.service");
const {
    getMonitorById,
} = require("../services/monitor.service");

async function getHealthCheckHistory(req, res) {
    try {
        const { monitorId } = req.params;

        const monitor = await getMonitorById(
            monitorId,
            req.user.organizationId
        );
         if (!monitor) {
            return res.status(404).json({
                message: "Monitor not found",
            });
        }

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