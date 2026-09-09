import { GoogleLoginButton } from "../components/google-login-button"
import { loginWithGoogle } from "../features/auth/login"


export function LoginPage() {
    return (
        <main>
            <h1>Welcome</h1>
            <GoogleLoginButton onLogin={loginWithGoogle}/>
        </main>
    )
}