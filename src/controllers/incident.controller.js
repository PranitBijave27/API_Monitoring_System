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
        const {
            status,
            page = "1",
            limit = "20",
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
        if (status && !["OPEN", "RESOLVED"].includes(status)) {
            return res.status(400).json({
                message: "Invalid incident status",
            });
        }
        const offset = (pageNumber - 1) * limitNumber;

        const monitor = await getMonitorById(
            monitorId,
            req.user.organizationId
        );
        if (!monitor) {
            return res.status(404).json({
                message: "Monitor not found"
            });
        }

        const result = await getIncidentsByMonitorId(
            monitorId,
            status,
            limitNumber,
            offset
        );
        const totalPages = Math.ceil(result.total / limitNumber);

        res.status(200).json({
            data: result.incidents,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: result.total,
                totalPages,
            },
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
        const {
            status,
            page = "1",
            limit = "20",
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
                message:
                    "Limit must be an integer between 1 and 100",
            });
        }

        if (status &&
            !["OPEN", "RESOLVED"].includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid incident status"
            });
        }
        const offset = (pageNumber - 1) * limitNumber;


        const result = await getIncidents(
            status,
            req.user.organizationId,
            limitNumber,
            offset);

        const totalPages = Math.ceil(result.total / limitNumber);

        res.status(200).json({
            data: result.incidents,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total: result.total,
                totalPages,
            },
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