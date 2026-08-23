const applicationService = require(
    "../services/application.service"
);

const dependencyService = require(
    "../services/dependency.service"
);


async function createDependency(req, res) {
    try {
        const { applicationId } = req.params;
        const { name, type, provider } = req.body;

        if (!name || !type) {
            return res.status(400).json({
                message: "Name and type are required",
            });
        }

        const application =
            await applicationService.getApplicationById(
                applicationId,
                req.user.organizationId
            );

        if (!application) {
            return res.status(404).json({
                message: "Application not found",
            });
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
    } catch (error) {
        console.error("Create dependency error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

async function getDependencies(req, res) {
    try {
        const { applicationId } = req.params;

        const application = await applicationService.getApplicationById(
            applicationId,
            req.user.organizationId
        );

        if (!application) {
            return res.status(404).json({
                message: "Application not found",
            });
        }

        const dependencies = await dependencyService.getDependenciesByApplicationId(
            applicationId
        );

        return res.status(200).json({
            data: dependencies,
        });
    } catch (error) {
        console.error("Get dependencies error:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

module.exports = {
    createDependency,
    getDependencies,
};