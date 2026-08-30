const API_URL = 'http://localhost:3000/api'

export async function getApplications(token) {
    const response = await fetch(`${API_URL}/applications`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) throw new Error('Failed to fetch applications')
    const data = await response.json()
    return data
}