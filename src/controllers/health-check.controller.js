const { getHealthChecksByMonitorId, } = require("../services/health-check-result.service");
const { getMonitorById, } = require("../services/monitor.service");
const asyncHandler = require("../utils/async-handler");
const AppError = require("../utils/app-error");
const { getPagination, } = require("../utils/pagination");

const getHealthCheckHistory = asyncHandler(
    async (req, res) => {
        const { monitorId } = req.params;

        //for Pagination and filtering
        const { status } = req.query;

        const {
            page ,
            limit,
            offset,
        } = getPagination(req.query);

        if (status && !["UP", "DOWN"].includes(status)) {
            throw new AppError("Invalid health check status", 400);
        }
     

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
                limit,
                offset,
                status
            );
        const totalPages = Math.ceil(result.total / limit);

        res.status(200).json({
            data: result.healthChecks,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages,
            },
        });
    }
);

module.exports = {
    getHealthCheckHistory,
};