const express = require("express");

const dependencyController = require(
    "../controllers/dependency.controller"
);

const router = express.Router({mergeParams:true});

router.post(
    "/",
    dependencyController.createDependency
);

router.get(
    "/",
    dependencyController.getDependencies
);

module.exports = router;