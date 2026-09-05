import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
    getApplicationOverview,
    getApplicationDependencies,
} from '../services/applicationService'

function ApplicationDetails() {
    const { applicationId } = useParams()
    const navigate = useNavigate()

    const [application, setApplication] = useState(null)
    const [dependencies, setDependencies] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadApplicationDetails() {
            try {
                const token = localStorage.getItem('token')

                const [overviewResponse, dependenciesResponse] =
                    await Promise.all([
                        getApplicationOverview(applicationId, token),
                        getApplicationDependencies(applicationId, token),
                    ])

                setApplication(overviewResponse.application)

                setDependencies(dependenciesResponse.data)
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        loadApplicationDetails()
    }, [applicationId])

    if (loading) {
        return <p>Loading application...</p>
    }

    if (error) {
        return <p>{error}</p>
    }

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
                        Dependencies ({dependencies.length})
                    </h3>
                </div>

                <div className="dependencies-list">
                    {dependencies.map((dependency) => (
                        <div
                            key={dependency.id}
                            className="dependency-card"
                        >
                            <div className="dependency-header">
                                <div>
                                    <h4>{dependency.name}</h4>

                                    <p className="dependency-provider">
                                        {dependency.provider}
                                    </p>
                                </div>

                                <div className="dependency-meta">
                                    <span className="dependency-type">
                                        {dependency.type}
                                    </span>

                                    <span
                                        className={`status-badge ${dependency.status.toLowerCase()}`}
                                    >
                                        ● {dependency.status}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="view-details-button"
                                onClick={() =>
                                    navigate(
                                        `/applications/${applicationId}/dependencies/${dependency.id}`
                                    )
                                }
                            >
                                View Monitors →
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default ApplicationDetails