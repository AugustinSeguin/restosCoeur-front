import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { Button, TextInput } from "../components/generic";
import { useAuth } from "../contexts/AuthContext";
import type { User } from "../types/User";

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Email et mot de passe sont requis.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await api.post<{ token: string; user: User }>(
        "/auth/login",
        {
          email: email.trim(),
          password,
        },
      );

      login(response.data.token, response.data.user);
    } catch {
      setErrorMessage("Identifiants invalides.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-5 py-8">
      <div className="grid w-full max-w-md gap-4 rounded-md border-2 border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--bg-color)_85%,white_15%)] p-6 text-center">
        <h1 className="m-0 text-3xl font-semibold text-[var(--color-primary)]">
          Connexion
        </h1>
        <TextInput
          label="Email"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextInput
          label="Mot de passe"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {errorMessage ? (
          <p className="m-0 rounded-lg border border-[var(--color-error)]/50 bg-[var(--color-error)]/10 px-3 py-2 text-sm text-[var(--color-error)]">
            {errorMessage}
          </p>
        ) : null}
        <Button
          type="button"
          onClick={handleLogin}
          disabled={isSubmitting}
          className="rounded-md bg-[var(--color-primary)] px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </Button>
      </div>
    </main>
  );
};

export default LoginPage;
