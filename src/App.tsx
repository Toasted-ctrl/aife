import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ChatPage } from './pages/chat-page'
import { LoginPage } from './pages/login-page'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/chat" element={<ChatPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
