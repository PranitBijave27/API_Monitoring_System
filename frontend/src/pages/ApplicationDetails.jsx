import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApplicationOverview } from '../services/applicationService'

function ApplicationDetails() {
    const { applicationId } = useParams()
    const navigate = useNavigate()

    const [application, setApplication] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadApplicationOverview() {
            try {
                const token = localStorage.getItem('token')

                const response = await getApplicationOverview(
                    applicationId,
                    token
                )

                setApplication(response.application)
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        loadApplicationOverview()
    }, [applicationId])

    if (loading) return <p>Loading application...</p>

    if (error) return <p>{error}</p>

    return (
        <div className="application-details-page">
            <button
                type="button"
                className="back-button"
                onClick={() => navigate('/applications')}
            >
                ← Back to Applications
            </button>

            <div className="application-details-header">
                <div>
                    <h2>{application.name}</h2>
                </div>

                <span
                    className={`status-badge ${application.status.toLowerCase()}`}
                >
                    ● {application.status}
                </span>
            </div>

            <section className="dependencies-section">
                <div className="section-header">
                    <h3>
                        Dependencies ({application.summary.total_dependencies})
                    </h3>
                </div>

                <div className="dependencies-list">
                    {application.dependencies.map((dependency) => (
                        <div
                            key={dependency.id}
                            className="dependency-card"
                        >
                            <div className="dependency-header">
                                <h4>{dependency.name}</h4>

                                <span
                                    className={`status-badge ${dependency.status.toLowerCase()}`}
                                >
                                    ● {dependency.status}
                                </span>
                            </div>

                            <div className="monitors-section">
                                <h5>
                                    Monitors ({dependency.monitors.length})
                                </h5>

                                {dependency.monitors.map((monitor) => (
                                    <div
                                        key={monitor.id}
                                        className="monitor-row"
                                    >
                                        <div>
                                            <strong>{monitor.name}</strong>

                                            <p>
                                                Last checked:{' '}
                                                {monitor.last_checked_at
                                                    ? new Date(
                                                        monitor.last_checked_at
                                                    ).toLocaleString()
                                                    : 'Never'}
                                            </p>
                                        </div>

                                        <div className="monitor-status">
                                            <span
                                                className={`status-badge ${monitor.current_status.toLowerCase()}`}
                                            >
                                                ● {monitor.current_status}
                                            </span>

                                            {monitor.consecutive_failures > 0 && (
                                                <span className="failure-count">
                                                    {monitor.consecutive_failures} consecutive failures
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default ApplicationDetails