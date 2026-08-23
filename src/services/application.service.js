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

//1st helper function of getApplicationOverview
function calculateDependencyStatus(monitors) {
    if (monitors.length === 0) {
        return "UNKNOWN";
    }

    const statuses = monitors.map(
        (monitor) => monitor.current_status
    );

    const hasUp = statuses.includes("UP");
    const hasDown = statuses.includes("DOWN");

    if (hasUp && hasDown) {
        return "DEGRADED";
    }

    if (hasDown) {
        return "DOWN";
    }

    if (hasUp) {
        return "UP";
    }

    return "UNKNOWN";
}
//2nd helper function of getApplicationOverview
function buildApplicationHierarchy(rows) {
    const application = {
        id: rows[0].application_id,
        name: rows[0].application_name,
        dependencies: []
    };

    const dependenciesMap = new Map();

    for (const row of rows) {
        if (!row.dependency_id) {
            continue;
        }

        let dependency = dependenciesMap.get(
            row.dependency_id
        );

        if (!dependency) {
            dependency = {
                id: row.dependency_id,
                name: row.dependency_name,
                monitors: []
            };

            dependenciesMap.set(
                row.dependency_id,
                dependency
            );

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

    return application;
}
//3rd helper function of getApplicationOverview
function calculateApplicationStatus(dependencies) {
    if (dependencies.length === 0) {
        return "UNKNOWN";
    }

    const dependencyStatuses = dependencies.map(
        (dependency) => dependency.status
    );

    const hasUp = dependencyStatuses.includes("UP");
    const hasDegraded = dependencyStatuses.includes("DEGRADED");
    const hasDown = dependencyStatuses.includes("DOWN");

    if (hasDown && !hasUp && !hasDegraded) {
        return "DOWN";
    }

    if (hasDown || hasDegraded) {
        return "DEGRADED";
    }

    if (hasUp) {
        return "UP";
    }

    return "UNKNOWN";
}
//4th helper function of getApplicationOverview
function buildApplicationSummary(dependencies) {
    const summary = {
        total_dependencies: dependencies.length,
        up: 0,
        degraded: 0,
        down: 0,
        unknown: 0
    };

    for (const dependency of dependencies) {
        if (dependency.status === "UP") {
            summary.up++;
        } else if (dependency.status === "DEGRADED") {
            summary.degraded++;
        } else if (dependency.status === "DOWN") {
            summary.down++;
        } else {
            summary.unknown++;
        }
    }

    return summary;
}

async function getApplicationOverview(applicationId) {
    // 1. Fetch rows
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
    // 2. Return null if application doesn't exist
    if (result.rows.length === 0) return null;

    // 3. Build hierarchy
    const application = buildApplicationHierarchy(
        result.rows
    );
    // 4. Calculate dependency statuses
    for (const dependency of application.dependencies) {
        dependency.status = calculateDependencyStatus(
            dependency.monitors
        );


    }

    application.status = calculateApplicationStatus(
        application.dependencies
    );
    application.summary = buildApplicationSummary(
        application.dependencies
    );

    return application;
}

module.exports = {
    createApplication,
    getApplications,
    getApplicationById,
    getApplicationOverview,
};