CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dependencies (
    id SERIAL PRIMARY KEY,

    application_id INTEGER NOT NULL,

    name VARCHAR(255) NOT NULL,

    type VARCHAR(50) NOT NULL,

    provider VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_application
        FOREIGN KEY (application_id)
        REFERENCES applications(id)
        ON DELETE CASCADE,

    CONSTRAINT valid_dependency_type
        CHECK (
            type IN (
                'EXTERNAL_API',
                'INTERNAL_SERVICE',
                'THIRD_PARTY'
            )
        )
);

CREATE TABLE monitors (
    id SERIAL PRIMARY KEY,

    dependency_id INTEGER NOT NULL,

    name VARCHAR(255) NOT NULL,

    url TEXT NOT NULL,

    method VARCHAR(10) NOT NULL DEFAULT 'GET',

    expected_status_code INTEGER NOT NULL DEFAULT 200,

    check_interval_seconds INTEGER NOT NULL DEFAULT 60,

    timeout_ms INTEGER NOT NULL DEFAULT 5000,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    current_status VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',

    consecutive_failures INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_dependency
        FOREIGN KEY (dependency_id)
        REFERENCES dependencies(id)
        ON DELETE CASCADE,

    CONSTRAINT valid_monitor_status
        CHECK (
            current_status IN ('UNKNOWN', 'UP', 'DOWN')
        ),

    CONSTRAINT valid_check_interval
        CHECK (check_interval_seconds > 0),

    CONSTRAINT valid_timeout
        CHECK (timeout_ms > 0)
);

CREATE TABLE health_checks (
    id SERIAL PRIMARY KEY,

    monitor_id INTEGER NOT NULL,

    status VARCHAR(20) NOT NULL,

    status_code INTEGER,

    response_time_ms INTEGER NOT NULL,

    error_type VARCHAR(50),

    checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_monitor
        FOREIGN KEY (monitor_id)
        REFERENCES monitors(id)
        ON DELETE CASCADE,

    CONSTRAINT valid_health_check_status
        CHECK (status IN ('UP', 'DOWN'))
);

CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,

    monitor_id INTEGER NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',

    started_at TIMESTAMP NOT NULL,

    detected_at TIMESTAMP NOT NULL,

    resolved_at TIMESTAMP,

    failure_reason VARCHAR(100),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_incident_monitor
        FOREIGN KEY (monitor_id)
        REFERENCES monitors(id)
        ON DELETE CASCADE,

    CONSTRAINT valid_incident_status
        CHECK (status IN ('OPEN', 'RESOLVED'))
);