const express = require("express");
const applicationRoutes = require("./routes/application.routes");
const dependencyRoutes = require("./routes/dependency.routes");
const monitorRoutes = require("./routes/monitor.routes");
const healthCheckRoutes = require("./routes/health-check.routes");
const incidentRoutes = require("./routes/incident.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const { errorHandler } = require("./middleware/error.middleware");
const cors = require("cors");
const app = express();

app.use(express.json());

app.use(
    cors({
        origin: "http://localhost:5173"
    })
);
app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/applications/:applicationId/dependencies", dependencyRoutes);
app.use("/api/dependencies/:dependencyId/monitors", monitorRoutes);
app.use("/api", healthCheckRoutes);
app.use("/api", incidentRoutes);

//Centralized error handler
app.use(errorHandler);

module.exports = app;