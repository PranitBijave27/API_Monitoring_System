const dependencyService = require(
    "../services/dependency.service"
);

const monitorService = require(
    "../services/monitor.service"
);

const ALLOWED_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
];

function validateMonitor(data) {
    const {
        name,
        url,
        method = "GET",
        expectedStatusCode = 200,
        checkIntervalSeconds = 60,
        timeoutMs = 5000,
    } = data;

    if (!name || !url) {
        return "Name and URL are required";
    }
    try {
        new URL(url); //checking is URL in correct format
    } catch {
        return "Invalid URL";
    }
    if (!ALLOWED_METHODS.includes(method.toUpperCase())) {
        return "Invalid HTTP method";
    }
    if (
        !Number.isInteger(expectedStatusCode) || expectedStatusCode < 100 || expectedStatusCode > 599) {
        return "Invalid expected status code";
    }
    if (!Number.isInteger(checkIntervalSeconds) || checkIntervalSeconds <= 0) {
        return "Check interval must be a positive integer";
    }
    if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
        return "Timeout must be a positive integer";
    }

    return null;
}

async function createMonitor(req, res) {
    try {
        const { dependencyId } = req.params;
         
        const dependency = await dependencyService.getDependencyById(
            dependencyId
        );

        if (!dependency) {
            return res.status(404).json({
                message: "Dependency not found",
            });
        }

        const validationError = validateMonitor(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError,
            });
        }
         

        const payload = {
            name: req.body.name,
            url: req.body.url,
            method: (req.body.method || "GET").toUpperCase(),
            expectedStatusCode:
                req.body.expectedStatusCode ?? 200,
            checkIntervalSeconds:
                req.body.checkIntervalSeconds ?? 60,
            timeoutMs:
                req.body.timeoutMs ?? 5000,
        };

        const monitor = await monitorService.createMonitor(
            dependencyId,
            payload
        );

        return res.status(201).json({
            message: "Monitor created successfully",
            data: monitor,
        });
    } catch (error) {
        console.error("Create monitor error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

async function getMonitors(req, res) {
    try {
        const { dependencyId } = req.params;

        const dependency = await dependencyService.getDependencyById(
            dependencyId
        );

        if (!dependency) {
            return res.status(404).json({
                message: "Dependency not found",
            });
        }

        const monitors = await monitorService.getMonitorsByDependencyId(
            dependencyId
        );

        return res.status(200).json({
            data: monitors,
        });
    } catch (error) {
        console.error("Get monitors error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

module.exports = {
    createMonitor,
    getMonitors,
};