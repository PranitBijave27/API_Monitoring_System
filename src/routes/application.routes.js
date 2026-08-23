const express = require("express");

const { authenticate } = require("../middleware/auth.middleware");
const applicationController =
    require("../controllers/application.controller");
const { getApplicationOverviewController
} = require("../controllers/application.controller");

const router = express.Router();

router.post(
    "/",
    authenticate,
    applicationController.createApplication
);

router.get(
    "/",
    authenticate,
    applicationController.getApplications
);

router.get(
    "/:applicationId/overview",
    authenticate,
    getApplicationOverviewController
);

router.get(
    "/:id",
    authenticate,
    applicationController.getApplication
);

module.exports = router;