import { useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <header className="header">
      <h1>API Dependency Monitor</h1>

      <div className="header-user">
        <span>User</span>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header