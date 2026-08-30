function Dashboard() {
    return (
        <div className="dashboard">
            <div className="page-header">
                <div>
                    <h2>Dashboard</h2>
                    <p>
                        Monitor the health of your applications and dependencies.
                    </p>
                </div>
            </div>

            <section className="summary-grid">
                <div className="summary-card">
                    <span>Applications</span>
                    <strong>0</strong>
                </div>

                <div className="summary-card">
                    <span>Healthy</span>
                    <strong>0</strong>
                </div>

                <div className="summary-card">
                    <span>Active Incidents</span>
                    <strong>0</strong>
                </div>
            </section>

            <section className="applications-section">
                <div className="section-header">
                    <h3>Applications</h3>
                </div>

                <div className="application-list">
                    <div className="application-card">
                        <div>
                            <h4>Example Application</h4>
                            <p>Application description</p>
                        </div>

                        <span className="status-badge">
                            HEALTHY
                        </span>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Dashboard