const applicationService = require("../services/application.service");
const dependencyService = require("../services/dependency.service");
const asyncHandler = require("../utils/async-handler");
const AppError = require("../utils/app-error");


const createDependency = asyncHandler(
    async (req, res) => {
        const { applicationId } = req.params;
        const { name, type, provider } = req.body;

        if (!name || !type) {
            throw new AppError("Name and type are required", 400);
        }

        const application =
            await applicationService.getApplicationById(
                applicationId,
                req.user.organizationId
            );

        if (!application) {
            throw new AppError("Application not found", 404);
        }

        const dependency =
            await dependencyService.createDependency(
                applicationId,
                name,
                type,
                provider
            );

        return res.status(201).json({
            message: "Dependency created successfully",
            data: dependency,
        });
    }
);

const getDependencies = asyncHandler(
    async (req, res) => {
        const { applicationId } = req.params;

        const application = await applicationService.getApplicationById(
            applicationId,
            req.user.organizationId
        );

        if (!application) {
            throw new AppError("Application not found", 404);
        }

        const dependencies = await dependencyService.getDependenciesByApplicationId(
            applicationId
        );

        return res.status(200).json({
            data: dependencies,
        });

    }
);

module.exports = {
    createDependency,
    getDependencies,
};