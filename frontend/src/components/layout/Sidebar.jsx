import { NavLink } from 'react-router-dom'

function Sidebar() {
    return (
        <aside>
            <h2>API Monitor</h2>
            <nav>
                <ul>
                    <li>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                    </li>

                    <li>
                        <NavLink to="/applications">Applications</NavLink>
                    </li>

                    <li>
                        <NavLink to="/incidents">Incidents</NavLink>
                    </li>
                </ul>
            </nav>
        </aside>
    )
}

export default Sidebar