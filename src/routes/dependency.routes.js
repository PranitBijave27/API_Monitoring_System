const express = require("express");

const dependencyController = require(
    "../controllers/dependency.controller"
);
const {authenticate, authorize}=require("../middleware/auth.middleware");


const router = express.Router({mergeParams:true});

router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    dependencyController.createDependency
);

router.get(
    "/",
    authenticate,
    dependencyController.getDependencies
);

module.exports = router;