"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function onSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setError(data.error || "Login failed.");
                return;
            }

            router.push("/");
            router.refresh();
        } catch {
            setError("Unable to login right now.");
        } finally {
            setLoading(false);
        }
    }

    return ( <
        main className = "auth-shell" >
        <
        article className = "auth-card" >
        <
        p className = "kicker" > Admin - only access < /p> <
        h1 > Sari - Sari Store Login < /h1> <
        p className = "muted" > Use your store admin credentials to
        continue. < /p>

        <
        form onSubmit = { onSubmit }
        className = "auth-form" >
        <
        label >
        Username <
        input type = "text"
        value = { username }
        onChange = {
            (event) => setUsername(event.target.value) }
        required autoComplete = "username" /
        >
        <
        /label>

        <
        label >
        Password / PIN <
        input type = "password"
        value = { password }
        onChange = {
            (event) => setPassword(event.target.value) }
        required autoComplete = "current-password" /
        >
        <
        /label>

        {
            error ? < p className = "error-text" > { error } < /p> : null}

            <
            button className = "btn btn-primary"
            type = "submit"
            disabled = { loading } > { loading ? "Signing in..." : "Login" } <
                /button> <
                /form> <
                /article> <
                /main>
        );
    }