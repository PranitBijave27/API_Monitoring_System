const { getHealthChecksByMonitorId, } = require("../services/health-check-result.service");
const {
    getMonitorById,
} = require("../services/monitor.service");

async function getHealthCheckHistory(req, res) {
    try {
        const { monitorId } = req.params;

        //for Pagination and filtering
        const {
            page = "1",
            limit = "20",
            status,
        } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (!Number.isInteger(pageNumber) || pageNumber < 1) {
            return res.status(400).json({
                message: "Page must be a positive integer",
            });
        }

        if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
            return res.status(400).json({
                message: "Limit must be an integer between 1 and 100",
            });
        }

        if (status && !["UP", "DOWN"].includes(status)) {
            return res.status(400).json({
                message: "Invalid health check status",
            });
        }
        const offset = (pageNumber - 1) * limitNumber;

        const monitor = await getMonitorById(
            monitorId,
            req.user.organizationId
        );
        if (!monitor) {
            return res.status(404).json({
                message: "Monitor not found",
            });
        }

        const result =
            await getHealthChecksByMonitorId(
                monitorId,
                limitNumber,
                offset,
                status
            );
        const totalPages = Math.ceil(result.total / limitNumber);

        res.status(200).json({
            data: result.healthChecks,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: result.total,
                totalPages,
            },
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