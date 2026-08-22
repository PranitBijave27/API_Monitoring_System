const pool = require("../config/db");

async function createApplication(name, description) {
    const query = `
    INSERT INTO applications (name, description)
    VALUES ($1, $2)
    RETURNING *
  `;

    const values = [name, description];

    const result = await pool.query(query, values);

    return result.rows[0];
}

async function getApplications() {
    const query = `
    SELECT *
    FROM applications
    ORDER BY created_at DESC
  `;

    const result = await pool.query(query);

    return result.rows;
}

async function getApplicationById(id) {
    const query = `
    SELECT *
    FROM applications
    WHERE id = $1
  `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
}

async function getApplicationOverview(applicationId) {
    const result = await pool.query(`
		 SELECT
            a.id AS application_id,
            a.name AS application_name,

            d.id AS dependency_id,
            d.name AS dependency_name,

            m.id AS monitor_id,
            m.name AS monitor_name,
            m.current_status AS monitor_status,
            m.last_checked_at,
            m.consecutive_failures

        FROM applications a

        LEFT JOIN dependencies d
            ON d.application_id = a.id

        LEFT JOIN monitors m
            ON m.dependency_id = d.id

        WHERE a.id = $1

        ORDER BY d.id, m.id
		`, [applicationId]
    );
    if (result.rows.length === 0) return null;

    const application = {
        id: result.rows[0].application_id,
        name: result.rows[0].application_name,
        dependencies: []
    };
    const dependenciesMap = new Map();
    for (const row of result.rows) {
        if (!row.dependency_id) {
            continue;
        }
        let dependency = dependenciesMap.get(row.dependency_id);
        if (!dependency) {
            dependency = {
                id: row.dependency_id,
                name: row.dependency_name,
                monitors: []
            };

            dependenciesMap.set(row.dependency_id, dependency);

            application.dependencies.push(dependency);
        }
        if (row.monitor_id) {
            dependency.monitors.push({
                id: row.monitor_id,
                name: row.monitor_name,
                current_status: row.monitor_status,
                last_checked_at: row.last_checked_at,
                consecutive_failures: row.consecutive_failures
            });
        }
    }
    for (const dependency of application.dependencies) {
        const monitors = dependency.monitors;

        if (monitors.length === 0) {
            dependency.status = "UNKNOWN";
            continue;
        }

        const statuses = monitors.map(
            (monitor) => monitor.current_status);

        const hasUp = statuses.includes("UP");
        const hasDown = statuses.includes("DOWN");

        if (hasUp && hasDown) dependency.status = "DEGRADED";
        else if (hasDown) dependency.status = "DOWN";
        else if (hasUp) dependency.status = "UP";
        else dependency.status = "UNKNOWN";

    }
    const dependencyStatuses = application.dependencies.map(
        (dependency) => dependency.status
    );

    if (dependencyStatuses.length === 0) {
        application.status = "UNKNOWN";
    } else {
        const hasUp = dependencyStatuses.includes("UP");
        const hasDegraded = dependencyStatuses.includes("DEGRADED");
        const hasDown = dependencyStatuses.includes("DOWN");

        if (hasDown && !hasUp && !hasDegraded) {
            application.status = "DOWN";
        } else if (hasDown || hasDegraded) {
            application.status = "DEGRADED";
        } else if (hasUp) {
            application.status = "UP";
        } else {
            application.status = "UNKNOWN";
        }
    }
    return application;
}

module.exports = {
    createApplication,
    getApplications,
    getApplicationById,
    getApplicationOverview,
};