export function loginWithGoogle() {
    const applicationKey = import.meta.env.VITE_API_KEY
    window.location.href = 
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/google/login?application_id=${encodeURIComponent(applicationKey)}`
}