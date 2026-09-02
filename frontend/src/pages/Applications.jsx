import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApplications } from '../services/applicationService'

function Applications() {
	const navigate = useNavigate()

	const [applications, setApplications] = useState([])
	const [search, setSearch] = useState('')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		async function loadApplications() {
			try {
				const token = localStorage.getItem('token')

				const response = await getApplications(token)

				setApplications(response.data)
			} catch (error) {
				setError(error.message)
			} finally {
				setLoading(false)
			}
		}

		loadApplications()
	}, [])
	const filteredApplications = applications.filter((application) =>
		application.name
			.toLowerCase()
			.includes(search.toLowerCase())
	)
	if (loading) {
		return <p>Loading applications...</p>
	}

	if (error) {
		return <p>{error}</p>
	}
	return (
		<div className="applications-page">
			<div className="page-header applications-page-header">
				<div>
					<h2>Applications</h2>
					<p>Manage and monitor your applications.</p>
				</div>

				<button
					type="button"
					className="create-application-button"
				>
					+ Create Application
				</button>
			</div>

			<div className="application-search">
				<input
					type="text"
					placeholder="Search applications..."
					value={search}
					onChange={(event) => setSearch(event.target.value)}
				/>
			</div>

			<div className="applications-list">
				{filteredApplications.map((application) => (
					<div
						key={application.id}
						className="application-card"
					>
						<div className="application-card-content">
							<h3>{application.name}</h3>

							<p className="application-card-description">
								{application.description}
							</p>

							<p className="application-created-at">
								Created: {new Date(application.created_at).toLocaleDateString()}
							</p>
						</div>

						<button
							type="button"
							className="view-details-button"
							onClick={() => navigate(`/applications/${application.id}`)}
						>
							View Details →
						</button>
					</div>
				))}
			</div>
		</div>
	)
}

export default Applications