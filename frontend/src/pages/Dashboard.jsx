import { useEffect, useState } from 'react'

import StatCard from '../components/dashboard/StatCard'
import ApplicationHealthCard from '../components/dashboard/ApplicationHealthCard'

import {
  getApplications,
  getApplicationOverview,
} from '../services/applicationService'

function Dashboard() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = localStorage.getItem('token')

        const applicationsResponse = await getApplications(token)

        const dashboardApplications = await Promise.all(
          applicationsResponse.data.map(async (application) => {
            const overview = await getApplicationOverview(
              application.id,
              token
            )

            const overviewApplication = overview.application

            const totalMonitors =
              overviewApplication.dependencies.reduce(
                (total, dependency) =>
                  total + dependency.monitors.length,
                0
              )

            return {
              id: application.id,
              name: application.name,
              description: application.description,
              status: overviewApplication.status,
              dependencies:
                overviewApplication.summary.total_dependencies,
              monitors: totalMonitors,
            }
          })
        )

        setApplications(dashboardApplications)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const totalApplications = applications.length

  const healthyApplications = applications.filter(
    (application) => application.status === 'UP'
  ).length

  // We will connect this to the incidents API later
  const activeIncidents = 0

  if (loading) {
    return <p>Loading dashboard...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

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
        <StatCard
          title="Applications"
          value={totalApplications}
        />

        <StatCard
          title="Healthy"
          value={healthyApplications}
        />

        <StatCard
          title="Active Incidents"
          value={activeIncidents}
        />
      </section>

      <section className="applications-section">
        <div className="section-header">
          <h3>Applications</h3>
        </div>

        <div className="application-list">
          {applications.map((application) => (
            <ApplicationHealthCard
              key={application.id}
              name={application.name}
              description={application.description}
              status={application.status}
              dependencies={application.dependencies}
              monitors={application.monitors}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Dashboard