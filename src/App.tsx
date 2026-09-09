import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DashBoardPage } from './pages/dashboard-page'
import { LoginPage } from './pages/login-page'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashBoardPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
