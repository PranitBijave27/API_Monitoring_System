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

const RANGE_TO_INTERVAL = {
    "1h": "1 hour",
    "24h": "24 hours",
    "7d": "7 days",
    "30d": "30 days",
};
// inserts a single health check row and returns it
async function insertHealthCheck(
    client, monitorId,
    result, checkedAt
) {
    const query = `
        INSERT INTO health_checks (
            monitor_id,
            status,
            status_code,
            response_time_ms,
            error_type,
            checked_at
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING * `;

    const healthCheckResult =
        await client.query(query, [
            monitorId,
            result.status,
            result.statusCode,
            result.responseTime,
            result.errorType,
            checkedAt,
        ]);

    return healthCheckResult.rows[0];
}

// locks the monitor row so concurrent checks can't race on consecutive_failures
async function getMonitorForUpdate(client, monitorId) {
    const result = await client.query(`
        SELECT
            current_status,
            consecutive_failures,
            failure_started_at
        FROM monitors
        WHERE id = $1
        FOR UPDATE`,
        [monitorId]
    );

    const monitor = result.rows[0];

    if (!monitor) {
        throw new Error("Monitor not found");
    }

    return monitor;
}

// figures out the monitor's new failure streak/status based on this latest result
function calculateMonitorState(
    monitor, result, checkedAt
) {
    if (result.status === "UP") {
        return {
            consecutiveFailures: 0,
            currentStatus: "UP",
            failureStartedAt: null,
        };
    }

    const consecutiveFailures =
        monitor.consecutive_failures + 1;

    const failureStartedAt =
        monitor.consecutive_failures === 0
            ? checkedAt
            : monitor.failure_started_at;

    const currentStatus =
        consecutiveFailures >= INCIDENT_THRESHOLD
            ? "DOWN"
            : monitor.current_status;

    return {
        consecutiveFailures,
        currentStatus,
        failureStartedAt,
    };
}

// persists the freshly calculated monitor state back to the DB
async function updateMonitorState(
    client, monitorId,
    monitorState, checkedAt
) {
    await client.query(`
        UPDATE monitors
        SET
            consecutive_failures = $1,
            failure_started_at = $2,
            current_status = $3,
            last_checked_at = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 `,
        [
            monitorState.consecutiveFailures,
            monitorState.failureStartedAt,
            monitorState.currentStatus,
            checkedAt, monitorId,
        ]
    );
}

// closes out the open incident for this monitor if the check just came back UP
async function resolveOpenIncident(
    client, monitorId,
    result, checkedAt
) {
    if (result.status !== "UP") {
        return null;
    }

    const resolvedIncidentResult =
        await client.query(`
            UPDATE incidents
            SET
                status = 'RESOLVED',
                resolved_at = $1
            WHERE monitor_id = $2
            AND status = 'OPEN'
            RETURNING * `,
            [checkedAt, monitorId,]
        );

    if (resolvedIncidentResult.rowCount === 0) {
        return null;
    }

    const resolvedIncident = resolvedIncidentResult.rows[0];

    console.log(`Incident resolved for monitor ${monitorId}`);
    return resolvedIncident;
}

// opens a new incident the moment the failure streak crosses the threshold, not before
async function createIncidentIfThresholdReached(
    client, monitorId, monitor,
    monitorState, result, checkedAt
) {
    const thresholdJustReached =
        result.status === "DOWN" &&
        monitor.consecutive_failures < INCIDENT_THRESHOLD &&
        monitorState.consecutiveFailures >=
        INCIDENT_THRESHOLD;

    if (!thresholdJustReached) return null;


    const createdIncidentResult =
        await client.query(`
            INSERT INTO incidents (
                monitor_id,
                status,
                started_at,
                detected_at,
                failure_reason
            )
            VALUES ($1, 'OPEN', $2, $3, $4)
            RETURNING *`,
            [monitorId, monitorState.failureStartedAt,
                checkedAt, result.errorType,
            ]
        );

    const createdIncident = createdIncidentResult.rows[0];

    console.log(`Incident created for monitor ${monitorId}`);
    return createdIncident;
}

// sends the DOWN/RECOVERED emails after everything's committed, and never lets a failure here bubble up 
async function sendIncidentNotifications({
    monitorId, createdIncident, resolvedIncident,
}) {
    if (!createdIncident && !resolvedIncident) return;

    try {
        const alertDetails =
            await getAlertDetailsByMonitorId(
                monitorId
            );

        const recipients =
            await getAlertRecipientsByMonitorId(
                monitorId
            );

        if (recipients.length === 0) {
            console.log(
                `No ADMIN alert recipients found for monitor ${monitorId}`
            );
            return;
        }

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
    } catch (error) {
        console.error(`Failed to send alert for monitor ${monitorId}:`,
            error.message
        );
    }
}

// runs one health check result through the whole pipeline: save it, update monitor state, handle incidents, alert
async function saveHealthCheckResult(monitorId, result) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const checkedAt = new Date();

        const healthCheck =
            await insertHealthCheck(
                client, monitorId,
                result, checkedAt
            );

        const monitor =
            await getMonitorForUpdate(
                client, monitorId
            );

        const monitorState =
            calculateMonitorState(
                monitor,
                result,
                checkedAt
            );

        await updateMonitorState(
            client,
            monitorId,
            monitorState,
            checkedAt
        );
        const resolvedIncident =
            await resolveOpenIncident(
                client,
                monitorId,
                result,
                checkedAt
            );

        const createdIncident =
            await createIncidentIfThresholdReached(
                client,
                monitorId,
                monitor,
                monitorState,
                result,
                checkedAt
            );

        await client.query("COMMIT");
        await sendIncidentNotifications({
            monitorId,
            createdIncident,
            resolvedIncident,
        });
        return healthCheck;

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

//verifies is monitor belongs to same organization for getMonitorStats function
async function verifyMonitorAccess(
    monitorId,
    organizationId
) {
    const query = `
        SELECT m.id
        FROM monitors m
        JOIN dependencies d
            ON m.dependency_id = d.id
        JOIN applications a
            ON d.application_id = a.id
        WHERE m.id = $1
          AND a.organization_id = $2`;

    const result = await pool.query(
        query,
        [monitorId, organizationId]
    );
    if (result.rows.length === 0) return false;
    return true;
}
async function getMonitorStats(monitorId, organizationId, range) {
    const interval = RANGE_TO_INTERVAL[range]

    const hasAccess =
        await verifyMonitorAccess(monitorId, organizationId);

    if (!hasAccess) return null;

    const query = `
        SELECT
            COUNT(*) AS total_checks,
            COUNT(*) FILTER (
                WHERE status = 'UP'
            ) AS successful_checks,
            COUNT(*) FILTER (
                WHERE status = 'DOWN'
            ) AS failed_checks,
            ROUND(
                (COUNT(*) FILTER (
                    WHERE status = 'UP'
                )::numeric
                / NULLIF(COUNT(*), 0)
                ) * 100,2
            ) AS uptime_percentage,
            ROUND(
                AVG(response_time_ms)
            ) AS average_response_time,

            MIN(response_time_ms) AS min_response_time,
            MAX(response_time_ms) AS max_response_time

        FROM health_checks hc
        WHERE monitor_id = $1
          AND hc.checked_at >= NOW() - $2::INTERVAL
          AND hc.checked_at <=NOW()`;


    const result = await pool.query(query, [
        monitorId, interval
    ]);
    return result.rows[0];
}

module.exports = {
    saveHealthCheckResult,
    getHealthChecksByMonitorId,
    getMonitorStats,
};