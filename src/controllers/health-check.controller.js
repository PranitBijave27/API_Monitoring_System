const { getHealthChecksByMonitorId,
    getMonitorStats } = require("../services/health-check-result.service");
const { getMonitorById, } = require("../services/monitor.service");
const asyncHandler = require("../utils/async-handler");
const AppError = require("../utils/app-error");
const { getPagination, } = require("../utils/pagination");

const ALLOWED_RANGES = [
    "1h",
    "24h",
    "7d",
    "30d",
];


const getHealthCheckHistory = asyncHandler(
    async (req, res) => {
        const { monitorId } = req.params;

        //for Pagination and filtering
        const { status } = req.query;
        const {
            page,
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

const getMonitorStatsController = asyncHandler(
    async (req, res) => {
        const { monitorId } = req.params;
        const { organizationId } = req.user;
        const { range = "24h" } = req.query;

        if (!ALLOWED_RANGES.includes(range)) {
            throw new AppError("Invalid range. Allowed values: 1h, 24h, 30d", 400);
        }
        const stats = await getMonitorStats(
            monitorId,
            organizationId,
            range
        );
        if (!stats) throw new AppError("Monitor not found", 404);

        return res.status(200).json({
            data: stats,
        });
    }
);
module.exports = {
    getHealthCheckHistory,
    getMonitorStatsController
};