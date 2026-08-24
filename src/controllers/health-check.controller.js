const { getHealthChecksByMonitorId, } = require("../services/health-check-result.service");
const { getMonitorById, } = require("../services/monitor.service");
const asyncHandler = require("../utils/async-handler");
const AppError = require("../utils/app-error");


const getHealthCheckHistory = asyncHandler(
    async (req, res) => {
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
            throw new AppError("Page must be a positive integer", 400);
        }

        if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
            throw new AppError("Limit must be an integer between 1 and 100", 400);
        }

        if (status && !["UP", "DOWN"].includes(status)) {
            throw new AppError("Invalid health check status", 400);
        }
        const offset = (pageNumber - 1) * limitNumber;

        const monitor = await getMonitorById(
            monitorId,
            req.user.organizationId
        );
        if (!monitor) {
            throw new AppError("Monitor not found", 404);
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
    }
);

module.exports = {
    getHealthCheckHistory,
};