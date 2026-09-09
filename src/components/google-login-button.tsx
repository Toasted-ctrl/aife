type GoogleLoginButtonProps = {
    onLogin: () => void
}

export function GoogleLoginButton({
    onLogin,
}: GoogleLoginButtonProps) {
    return (
        <button onClick={onLogin}>
            Continue with Google
        </button>
    )
}