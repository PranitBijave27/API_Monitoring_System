import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../services/authService'

function Register() {
    const navigate = useNavigate()

    const [organizationName, setOrganizationName] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()

        setError('')
        setLoading(true)

        try {

            await registerUser(
                organizationName,
                name,
                email,
                password
            )
            navigate('/login')


        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Create Account</h2>
                <p>Create your organization and administrator account</p>

                {error && <p>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="organizationName">
                            Organization Name
                        </label>

                        <input
                            id="organizationName"
                            type="text"
                            value={organizationName}
                            onChange={(event) =>
                                setOrganizationName(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="name">Name</label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="register-email">Email</label>

                        <input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="register-password">Password</label>

                        <input
                            id="register-password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <p>
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </button>
                </p>
            </div>
        </div>
    )
}

export default Register