const express = require("express");
const applicationRoutes = require("./routes/application.routes");
const dependencyRoutes = require("./routes/dependency.routes");
const monitorRoutes = require("./routes/monitor.routes");
const healthCheckRoutes =require("./routes/health-check.routes");
const incidentRoutes = require("./routes/incident.routes");
const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

app.use("/api/applications", applicationRoutes);
app.use("/api/applications/:applicationId/dependencies", dependencyRoutes);
app.use("/api/dependencies/:dependencyId/monitors", monitorRoutes);
app.use("/api", healthCheckRoutes);
app.use("/api", incidentRoutes);


module.exports = app;