const pool = require("../config/db");
const INCIDENT_THRESHOLD = 3;

async function saveHealthCheckResult(monitorId, result) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const checkedAt = new Date();

        const insertHealthCheckQuery = `
            INSERT INTO health_checks (
            monitor_id,
            status,
            status_code,
            response_time_ms,
            error_type,
            checked_at
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`;

        const healthCheckResult = await client.query(
            insertHealthCheckQuery,
            [
                monitorId,
                result.status,
                result.statusCode,
                result.responseTime,
                result.errorType,
                checkedAt,
            ]);

        const monitorResult = await client.query(`
            SELECT
                current_status,
                consecutive_failures,
                failure_started_at
            FROM monitors
            WHERE id = $1
            FOR UPDATE`,
            [monitorId]
        );

        const monitor = monitorResult.rows[0];

        if (!monitor) {
            throw new Error("Monitor not found");
        }

        let consecutiveFailures;
        let currentStatus;
        let failureStartedAt;

        if (result.status === "UP") {
            consecutiveFailures = 0;
            currentStatus = "UP";
            failureStartedAt = null;
        } else {
            consecutiveFailures = monitor.consecutive_failures + 1;
            failureStartedAt =
                monitor.consecutive_failures === 0
                    ? checkedAt
                    : monitor.failure_started_at;

            currentStatus =
                consecutiveFailures >= INCIDENT_THRESHOLD
                    ? "DOWN"
                    : monitor.current_status;
        }

        await client.query(`
            UPDATE monitors
                SET
                    consecutive_failures = $1,
                    failure_started_at = $2,
                    current_status = $3,
                    last_checked_at = $4,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $5`, [
            consecutiveFailures,
            failureStartedAt,
            currentStatus,
            checkedAt,
            monitorId,
        ]);

        if (result.status === "UP") {
            const resolvedIncidentResult = await client.query(`
                UPDATE incidents
                SET
                    status = 'RESOLVED',
                    resolved_at = $1
                    WHERE monitor_id = $2
                    AND status = 'OPEN'
                RETURNING *`,
                [checkedAt, monitorId]
            );

            if (resolvedIncidentResult.rowCount > 0) {
                console.log(
                    `Incident resolved for monitor ${monitorId}`
                );
            }
        }


        const thresholdJustReached =
            result.status === "DOWN" &&
            monitor.consecutive_failures < INCIDENT_THRESHOLD &&
            consecutiveFailures >= INCIDENT_THRESHOLD;

        if (thresholdJustReached) {
            await client.query(`
                INSERT INTO incidents (
                    monitor_id,
                    status,
                    started_at,
                    detected_at,
                    failure_reason)
                    VALUES ($1, 'OPEN', $2, $3, $4)`, [
                monitorId,
                failureStartedAt,
                checkedAt,
                result.errorType,
            ]
            );

            console.log(
                `Incident created for monitor ${monitorId}`
            );
        }

        await client.query("COMMIT");
        return healthCheckResult.rows[0];

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }

}

async function getHealthChecksByMonitorId(monitorId) {
    const query = `
    SELECT
        id,
        monitor_id,
        status,
        status_code,
        response_time_ms,
        error_type,
        checked_at
    FROM health_checks
    WHERE monitor_id = $1
    ORDER BY checked_at DESC`;

    const result = await pool.query(query, [monitorId]);

    return result.rows;
}
module.exports = {
    saveHealthCheckResult,
    getHealthChecksByMonitorId,
};