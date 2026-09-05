import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
    getApplicationDependencies,
    getDependencyMonitors,
} from '../services/applicationService'

function DependencyDetails() {
    const {
        applicationId,
        dependencyId,
    } = useParams()

    const navigate = useNavigate()

    const [dependency, setDependency] = useState(null)
    const [monitors, setMonitors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadDependencyDetails() {
            try {
                const token = localStorage.getItem('token')

                const [
                    dependenciesResponse,
                    monitorsResponse,
                ] = await Promise.all([
                    getApplicationDependencies(
                        applicationId,
                        token
                    ),
                    getDependencyMonitors(
                        dependencyId,
                        token
                    ),
                ])

                const selectedDependency =
                    dependenciesResponse.data.find(
                        (dependency) =>
                            dependency.id === Number(dependencyId)
                    )

                if (!selectedDependency) {
                    throw new Error('Dependency not found')
                }

                setDependency(selectedDependency)
                setMonitors(monitorsResponse.data)
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        loadDependencyDetails()
    }, [applicationId, dependencyId])

    if (loading) {
        return <p>Loading dependency...</p>
    }

    if (error) {
        return <p>{error}</p>
    }

    return (
        <div className="dependency-details-page">
            <button
                type="button"
                className="back-button"
                onClick={() =>
                    navigate(`/applications/${applicationId}`)
                }
            >
                ← Back to Application
            </button>

            <div className="dependency-details-header">
                <div>
                    <h2>{dependency.name}</h2>

                    <p className="dependency-provider">
                        {dependency.provider}
                    </p>
                </div>

                <span
                    className={`status-badge ${dependency.status.toLowerCase()}`}
                >
                    ● {dependency.status}
                </span>
            </div>

            <section className="monitors-section">
                <div className="section-header">
                    <h3>
                        Monitors ({monitors.length})
                    </h3>
                </div>

                <div className="monitors-list">
                    {monitors.map((monitor) => (
                        <div
                            key={monitor.id}
                            className="monitor-card"
                        >
                            <div className="monitor-card-header">
                                <div>
                                    <h4>{monitor.name}</h4>

                                    <p className="monitor-last-checked">
                                        Last checked:{' '}
                                        {monitor.last_checked_at
                                            ? new Date(
                                                monitor.last_checked_at
                                            ).toLocaleString()
                                            : 'Never'}
                                    </p>
                                </div>

                                <span
                                    className={`status-badge ${monitor.current_status.toLowerCase()}`}
                                >
                                    ● {monitor.current_status}
                                </span>
                            </div>

                            <div className="monitor-details">
                                <span>
                                    Consecutive failures:{' '}
                                    {monitor.consecutive_failures}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default DependencyDetails