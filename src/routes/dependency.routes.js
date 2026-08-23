const express = require("express");

const dependencyController = require(
    "../controllers/dependency.controller"
);
const {authenticate,}=require("../middleware/auth.middleware");


const router = express.Router({mergeParams:true});

router.post(
    "/",
    authenticate,
    dependencyController.createDependency
);

router.get(
    "/",
    authenticate,
    dependencyController.getDependencies
);

module.exports = router;