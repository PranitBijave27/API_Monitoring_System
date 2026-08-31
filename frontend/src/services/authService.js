const API_URL = 'http://localhost:3000/api'

export async function loginUser(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
        }),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Login failed')
    }

    return data
}

export async function registerUser(
    organizationName,
    name,
    email,
    password
) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            organizationName,
            name,
            email,
            password,
        }),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
    }

    return data
}