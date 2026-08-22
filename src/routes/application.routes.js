const express = require("express");

const applicationController =
    require("../controllers/application.controller");

const { getApplicationOverviewController
} = require("../controllers/application.controller");

const router = express.Router();

router.post(
    "/",
    applicationController.createApplication
);

router.get(
    "/",
    applicationController.getApplications
);

router.get(
    "/:applicationId/overview",
    getApplicationOverviewController
);

router.get(
    "/:id",
    applicationController.getApplication
);

module.exports = router;