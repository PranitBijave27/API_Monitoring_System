function ApplicationHealthCard({
    name,
    description,
    status,
    dependencies,
    monitors,
}) {
    const statusClass = status.toLowerCase()
    return (
        <div className="application-health-card">
            <div className="application-health-card-header">
                <h4>{name}</h4>

                <span className={`status-badge ${statusClass}`}>
                    ● {status}
                </span>
            </div>

            <p className="application-description">
                {description}
            </p>

            <p className="application-meta">
                {dependencies} dependencies · {monitors} monitors
            </p>
        </div>
    )
}

export default ApplicationHealthCard