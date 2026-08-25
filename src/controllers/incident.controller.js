const { getIncidentsByMonitorId, getIncidents } = require("../services/incident.service");
const { getMonitorById, } = require("../services/monitor.service");
const asyncHandler = require("../utils/async-handler");
const AppError = require("../utils/app-error");
const { getPagination, } = require("../utils/pagination");

const getIncidentHistory = asyncHandler(
    async (req, res) => {
        const { monitorId } = req.params;
        const { status } = req.query;

        const {
            page,
            limit,
            offset,
        } = getPagination(req.query);


        if (status && !["OPEN", "RESOLVED"].includes(status)) {
            throw new AppError("Invalid incident status", 400);
        }

        const monitor = await getMonitorById(
            monitorId,
            req.user.organizationId
        );
        if (!monitor) {
            throw new AppError("Monitor not found", 404);
        }

        const result = await getIncidentsByMonitorId(
            monitorId,
            status,
            limit,
            offset
        );
        const totalPages = Math.ceil(result.total / limit);

        res.status(200).json({
            data: result.incidents,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages,
            },
        });
    }
);

const getAllIncidents = asyncHandler(
    async (req, res) => {
        const { status } = req.query;
        const {
            page,
            limit,
            offset,
        } = getPagination(req.query);

        if (status &&
            !["OPEN", "RESOLVED"].includes(status)
        ) {
            throw new AppError("Invalid incident status", 400);
        }

        const result = await getIncidents(
            status,
            req.user.organizationId,
            limit,
            offset
        );

        const totalPages = Math.ceil(result.total / limit);

        res.status(200).json({
            data: result.incidents,
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
    getIncidentHistory,
    getAllIncidents
};