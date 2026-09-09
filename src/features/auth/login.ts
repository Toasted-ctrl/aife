export function loginWithGoogle() {
    const applicationKey = import.meta.env.VITE_API_KEY
    window.location.href = 
        `https://ai-api.beakfeather.com/api/v1/auth/google/login/${encodeURIComponent(applicationKey)}`
}