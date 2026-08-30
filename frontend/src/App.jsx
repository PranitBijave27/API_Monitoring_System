import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Applications from './pages/Applications'
import Incidents from './pages/Incidents'



function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/applications" element={<Applications />} />
                    <Route path="/incidents" element={<Incidents />} />

                    <Route
                        path="*"
                        element={<Navigate to="/dashboard" replace />}
                    />
                </Routes>
            </Layout>
        </BrowserRouter>
    )


}

export default App
