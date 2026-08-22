const cron = require("node-cron");
const monitorService = require("../services/monitor.service");
const { performHealthCheck, } = require("../services/health-check.service");
const { saveHealthCheckResult, } = require("../services/health-check-result.service");


function startMonitorScheduler() {
    cron.schedule("* * * * *", async () => {
        try {
            console.log("\nScheduler running...");

            const dueMonitors = await monitorService.getDueMonitors();

            console.log(`Due monitors found: ${dueMonitors.length}`);

            for (const monitor of dueMonitors) {
                try {
                    console.log(`Monitor due:  ${monitor.id} - ${monitor.name}`);
                    const result = await performHealthCheck(monitor);
                    console.log("Health check result:", result);
                    await saveHealthCheckResult(monitor.id, result);
                    console.log(`Monitor ${monitor.id} checked successfully`);

                } catch (error) {
                    console.error(`Failed to check monitor ${monitor.id}:`, error.message);
                }
            }
        } catch (error) {
            console.error("Scheduler error:", error.message);
        }
    });

    console.log("Monitor scheduler started");
}

module.exports = {
    startMonitorScheduler,
};