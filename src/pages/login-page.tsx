import { GoogleLoginButton } from "../components/google-login-button"
import { loginWithGoogle } from "../features/auth/login"

export function LoginPage() {
    return (
        <main className="flex min-h-svh items-center justify-center bg-zinc-950 px-4">
            <div className="w-full max-w-sm">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white">
                        AIFE
                    </h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        Sign in to continue
                    </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl shadow-black/40">
                    <GoogleLoginButton onLogin={loginWithGoogle} />

                    <p className="mt-6 text-center text-xs text-zinc-500">
                        By continuing, you agree to our{" "}
                        <a href="#" className="text-zinc-400 underline underline-offset-2 hover:text-white transition-colors">
                            Terms of Service
                        </a>
                    </p>
                </div>
            </div>
        </main>
    )
}