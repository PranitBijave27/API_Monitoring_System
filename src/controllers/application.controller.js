const applicationService = require("../services/application.service");
const asyncHandler = require("../utils/async-handler");
const AppError = require("../utils/app-error");


const createApplication = asyncHandler(
    async (req, res) => {
        const { name, description } = req.body;

        if (!name) {
            throw new AppError("Application name is required", 400);
        }

        const application =
            await applicationService.createApplication(
                name,
                description,
                req.user.organizationId
            );

        return res.status(201).json({
            message: "Application created successfully",
            data: application,
        });
    }
);

const getApplications = asyncHandler(
    async (req, res) => {
        const applications =
            await applicationService.getApplications(
                req.user.organizationId
            );

        return res.status(200).json({
            data: applications,
        });

    });

const getApplication = asyncHandler(
    async (req, res) => {
        const { id } = req.params;
        const { organizationId } = req.user;

        const application = await applicationService.getApplicationById(id, organizationId);

        if (!application) {
            throw new AppError("Application not found", 404);
        }

        return res.status(200).json({
            application,
        });
    }
);

const getApplicationOverviewController = asyncHandler(
    async (req, res) => {
        const { applicationId } = req.params;

        const application =
            await applicationService.getApplicationOverview(
                applicationId,
                req.user.organizationId
            );

        if (!application) {
            throw new AppError("Application not found", 404);

        }

        return res.status(200).json({
            application
        });
    }
);

module.exports = {
    createApplication,
    getApplications,
    getApplication,
    getApplicationOverviewController,
};