import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosConfig";
import { Button, TextInput } from "../../components/generic";
import { useAuth } from "../../contexts/AuthContext";
import { UserType, type User } from "../../types/User";

type UserUpdatePayload = {
  lastName: string;
  firstName: string;
  birthdate: string;
  codePostal: string;
  email: string;
  phoneNumber: string;
  password?: string;
  isActive: boolean;
  isAdmin: boolean;
  type: UserType;
};

const UserEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token, user, setUser } = useAuth();

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordPlaceholder, setPasswordPlaceholder] =
    useState("Mot de passe");
  const [basePayload, setBasePayload] = useState<
    Omit<UserUpdatePayload, "lastName" | "firstName" | "codePostal" | "email">
  >({
    birthdate: "",
    phoneNumber: "",
    isActive: true,
    isAdmin: true,
    type: UserType.permanent,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isOwnProfile = useMemo(() => {
    return user?.id.toString() === id;
  }, [id, user?.id]);

  const loadUserData = useCallback(async () => {
    if (!id || !token) {
      setErrorMessage("Impossible de charger l'utilisateur.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get<User>(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data;

      setLastName(userData.lastName);
      setFirstName(userData.firstName);
      setCodePostal(userData.codePostal);
      setEmail(userData.email ?? "");
      setPassword("");
      setBasePayload({
        birthdate: userData.birthdate.slice(0, 10),
        phoneNumber: userData.phoneNumber,
        isActive: userData.isActive,
        isAdmin: userData.isAdmin,
        type: userData.type,
      });
    } catch {
      if (isOwnProfile && user) {
        setLastName(user.lastName);
        setFirstName(user.firstName);
        setCodePostal(user.codePostal);
        setEmail(user.email ?? "");
        setPassword("");
        setBasePayload((prev) => ({
          ...prev,
          birthdate: user.birthdate.slice(0, 10),
          isAdmin: user.isAdmin,
          type: user.type,
        }));
      } else {
        setErrorMessage("Erreur lors du chargement de l'utilisateur.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, isOwnProfile, token, user]);

  useEffect(() => {
    void loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    const updatePlaceholder = () => {
      setPasswordPlaceholder(
        globalThis.innerWidth < 640
          ? "Nouveau mot de passe"
          : "Laisser vide pour conserver le mot de passe actuel",
      );
    };

    updatePlaceholder();
    globalThis.addEventListener("resize", updatePlaceholder);

    return () => {
      globalThis.removeEventListener("resize", updatePlaceholder);
    };
  }, []);

  const handleEdit = async () => {
    if (!token || !id) {
      setErrorMessage("Impossible de modifier l'utilisateur.");
      return;
    }

    if (
      !lastName.trim() ||
      !firstName.trim() ||
      !codePostal.trim() ||
      !email.trim()
    ) {
      setErrorMessage("Nom, prenom, code postal et email sont requis.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload: UserUpdatePayload = {
        ...basePayload,
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        codePostal: codePostal.trim(),
        email: email.trim(),
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      const response = await api.put<User>(`/users/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (isOwnProfile) {
        setUser(response.data);
      }

      navigate("/board", { replace: true });
    } catch {
      setErrorMessage("Erreur lors de la mise a jour de l'utilisateur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-5xl rounded-2xl border-2 border-[var(--color-primary)]/45 bg-[var(--bg-color)]/70 p-6">
        <p className="m-0 text-sm text-[var(--color-text)]">
          Chargement du profil...
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 rounded-2xl border-2 border-[var(--color-primary)]/45 bg-[var(--bg-color)]/70 p-4 sm:p-8">
      <header className="relative flex items-center justify-center">
        <h1 className="m-0 text-center text-xl font-semibold italic text-[var(--color-primary)] sm:text-2xl">
          Editer mon profil
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInput
          label="Nom"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
        <TextInput
          label="Prenom"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInput
          label="Code postal"
          type="number"
          value={codePostal}
          onChange={(event) => setCodePostal(event.target.value)}
        />
        <TextInput
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <TextInput
          label="Nouveau mot de passe"
          type="password"
          placeholder={passwordPlaceholder}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {errorMessage ? (
        <p className="m-0 rounded-lg border border-[var(--color-error)]/50 bg-[var(--color-error)]/10 px-3 py-2 text-sm text-[var(--color-error)]">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button
          type="button"
          onClick={handleEdit}
          disabled={isSubmitting}
          className="rounded-lg bg-[var(--color-primary)] px-6 py-2 font-medium text-white transition-colors hover:bg-[var(--color-primary)]/90 disabled:opacity-50"
        >
          {isSubmitting ? "Edition en cours..." : "Editer"}
        </Button>

        <Button
          type="button"
          onClick={() => navigate("/board")}
          className="rounded-lg border border-[var(--color-primary)] bg-white px-6 py-2 font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Annuler
        </Button>
      </div>
    </section>
  );
};

export default UserEdit;
