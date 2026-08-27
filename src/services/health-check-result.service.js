const pool = require("../config/db");

const {
    getAlertDetailsByMonitorId,
    getAlertRecipientsByMonitorId,
} = require("../services/alert.service");

const {
    sendDependencyDownAlert,
    sendDependencyRecoveredAlert
} = require("../services/email.service");

const INCIDENT_THRESHOLD = 3;

async function saveHealthCheckResult(monitorId, result) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const checkedAt = new Date();
        let createdIncident = null;
        let resolvedIncident = null;

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
                resolvedIncident =
                    resolvedIncidentResult.rows[0];


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
            const createdIncidentResult = await client.query(`
                INSERT INTO incidents (
                    monitor_id,
                    status,
                    started_at,
                    detected_at,
                    failure_reason)
                    VALUES ($1, 'OPEN', $2, $3, $4)
                    RETURNING *
                `, [
                monitorId,
                failureStartedAt,
                checkedAt,
                result.errorType,
            ]
            );
            createdIncident =
                createdIncidentResult.rows[0];

            console.log(
                `Incident created for monitor ${monitorId}`
            );
        }

        await client.query("COMMIT");


        try {
            if (createdIncident || resolvedIncident) {
                const alertDetails =
                    await getAlertDetailsByMonitorId(monitorId);

                const recipients =
                    await getAlertRecipientsByMonitorId(monitorId);

                if (createdIncident) {
                    await sendDependencyDownAlert({
                        to: recipients,
                        applicationName:
                            alertDetails.application_name,
                        dependencyName:
                            alertDetails.dependency_name,
                        monitorName:
                            alertDetails.monitor_name,
                        monitorUrl:
                            alertDetails.monitor_url,
                        failureReason:
                            createdIncident.failure_reason,
                        detectedAt:
                            createdIncident.detected_at,
                    });
                }

                if (resolvedIncident) {
                    await sendDependencyRecoveredAlert({
                        to: recipients,
                        applicationName:
                            alertDetails.application_name,
                        dependencyName:
                            alertDetails.dependency_name,
                        monitorName:
                            alertDetails.monitor_name,
                        monitorUrl:
                            alertDetails.monitor_url,
                        startedAt:
                            resolvedIncident.started_at,
                        resolvedAt:
                            resolvedIncident.resolved_at,
                    });
                }
            }
        } catch (error) {
            console.error(
                `Failed to send alert for monitor ${monitorId}:`,
                error.message
            );

        }
        return healthCheckResult.rows[0];

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }

}

async function getHealthChecksByMonitorId(
    monitorId,
    limit,
    offset,
    status
) {
    let query = `
    SELECT
        id,
        monitor_id,
        status,
        status_code,
        response_time_ms,
        error_type,
        checked_at
    FROM health_checks
    WHERE monitor_id = $1`;

    const values = [monitorId];

    if (status) {
        query += ` AND status = $2`;
        values.push(status);
        query += ` ORDER BY checked_at DESC
            LIMIT $3
            OFFSET $4`;
        values.push(limit, offset);
    } else {
        query += ` ORDER BY checked_at DESC
            LIMIT $2
            OFFSET $3`;
        values.push(limit, offset);
    }

    const result = await pool.query(query, values);

    let countQuery = `
        SELECT COUNT(*)
        FROM health_checks
        WHERE monitor_id = $1`;
    const countValues = [monitorId];

    if (status) {
        countQuery += ` AND status = $2`;
        countValues.push(status);
    }

    const countResult = await pool.query(
        countQuery,
        countValues
    );

    return {
        healthChecks: result.rows,
        total: Number(countResult.rows[0].count),
    };
}

module.exports = {
    saveHealthCheckResult,
    getHealthChecksByMonitorId,
};