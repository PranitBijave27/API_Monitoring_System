const applicationService = require("../services/application.service");

async function createApplication(req, res) {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Application name is required",
            });
        }

        const application =
            await applicationService.createApplication(
                name,
                description
            );

        return res.status(201).json({
            message: "Application created successfully",
            data: application,
        });
    } catch (error) {
        console.error("Create application error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

async function getApplications(req, res) {
    try {
        const applications =
            await applicationService.getApplications();

        return res.status(200).json({
            data: applications,
        });
    } catch (error) {
        console.error("Get applications error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

async function getApplication(req, res) {
    try {
        const { id } = req.params;

        const application = await applicationService.getApplicationById(id);

        if (!application) {
            return res.status(404).json({
                message: "Application not found",
            });
        }

        res.status(200).json({
            application,
        });
    } catch (error) {
        console.error(
            "Failed to fetch application:",
            error.message
        );

        res.status(500).json({
            message: "Failed to fetch application",
        });
    }
}

async function getApplicationOverviewController(req, res) {
    try {
        const { applicationId } = req.params;

        const application = await applicationService.getApplicationOverview(applicationId);

        if (!application) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.status(200).json({
            application
        });
    } catch (error) {
        console.error("Error fetching application overview:", error);

        res.status(500).json({
            message: "Failed to fetch application overview"
        });
    }
}

module.exports = {
    createApplication,
    getApplications,
    getApplication,
    getApplicationOverviewController,
};