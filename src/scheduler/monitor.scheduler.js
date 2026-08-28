const cron = require("node-cron");
const monitorService = require("../services/monitor.service");
const { performHealthCheck, } = require("../services/health-check.service");
const { saveHealthCheckResult, } = require("../services/health-check-result.service");
const { processWithConcurrency, } = require("../utils/process-with-concurrency");

let isSchedulerRunning = false;
const MONITOR_CONCURRENCY = 5;

function startMonitorScheduler() {
    cron.schedule("* * * * *", async () => {
        if (isSchedulerRunning) {
            console.log(
                "Previous scheduler run is still running. Skipping this cycle."
            );
            return;
        }
        isSchedulerRunning = true;
        try {
            console.log("\nScheduler running...");
            const dueMonitors = await monitorService.getDueMonitors();

            console.log(`Due monitors found: ${dueMonitors.length}`);

            /*it allows sequential execution which gets bottleneck */
            // for (const monitor of dueMonitors) {
            //     try {
            //         console.log(`Monitor due:  ${monitor.id} - ${monitor.name}`);
            //         const result = await performHealthCheck(monitor);
            //         console.log("Health check result:", result);
            //         await saveHealthCheckResult(monitor.id, result);
            //         console.log(`Monitor ${monitor.id} checked successfully`);

            //     } catch (error) {
            //         console.error(`Failed to check monitor ${monitor.id}:`, error.message);
            //     }
            // }

            /*allows concurrent execution of this into batches*/
            await processWithConcurrency(
                dueMonitors, MONITOR_CONCURRENCY,
                async (monitor) => {
                    try {
                        console.log(`Monitor due: ${monitor.id} - ${monitor.name} UPDATE` );
                        const result =
                            await performHealthCheck(monitor);
                        console.log("Health check result:", result);

                        await saveHealthCheckResult(monitor.id, result);
                        console.log(`Monitor ${monitor.id} checked successfully`);
                    } catch (error) {
                        console.error(`Failed to check monitor ${monitor.id}:`, error.message);
                    }
                }
            );
        } catch (error) {
            console.error("Scheduler error:", error.message);
        } finally {
            isSchedulerRunning = false;
        }
    });

    console.log("Monitor scheduler started");
}

module.exports = {
    startMonitorScheduler,
};