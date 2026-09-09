import { useEffect, useState } from "react"
import { getUser, type User } from "../services/get-user"

export function DashBoardPage() {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        getUser()
            .then(setUser)
            .catch(console.error)
    }, [])

    if (!user) {
        return  <p>Loading...</p>
    }

    return (
        <main>
            <h1>Welcome</h1>
            <p>Your user ID is {user.id}</p>
        </main>
    )
}