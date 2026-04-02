import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import {
  Button,
  Checkbox,
  SelectList,
  TextInput,
  type SelectOption,
} from "../../components/generic";
import { useAuth } from "../../contexts/AuthContext";
import { UserType, type User } from "../../types/User";

const CreateUser = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [type, setType] = useState<UserType>(UserType.permanent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const userTypeOptions = useMemo<SelectOption[]>(
    () => [
      { label: "Permanent", value: UserType.permanent },
      { label: "Occasionnel", value: UserType.occasional },
      { label: "Nouveau", value: UserType.newcomer },
    ],
    [],
  );

  const handleCreate = async () => {
    if (!lastName.trim() || !firstName.trim()) {
      setErrorMessage("Le nom et le prenom sont requis.");
      return;
    }

    if (
      !birthdate ||
      !codePostal.trim() ||
      !email.trim() ||
      !phoneNumber.trim()
    ) {
      setErrorMessage("Tous les champs obligatoires doivent etre renseignes.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Le mot de passe est requis.");
      return;
    }

    if (!token) {
      setErrorMessage("Authentification requise pour creer un utilisateur.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await api.post<User>(
        "/users",
        {
          lastName: lastName.trim(),
          firstName: firstName.trim(),
          birthdate,
          codePostal: codePostal.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
          password,
          isActive,
          isAdmin,
          type,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      navigate("/users", { replace: true });
    } catch {
      setErrorMessage("Erreur lors de la creation. Veuillez reessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 rounded-2xl border-2 border-[var(--color-primary)]/45 bg-[var(--bg-color)]/70 p-4 sm:p-8">
      <header className="relative flex items-center justify-center">
        <h1 className="m-0 text-center text-xl font-semibold italic text-[var(--color-primary)] sm:text-2xl">
          Creer un admin
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInput
          label="Nom"
          placeholder="Nom"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
        <TextInput
          label="Prenom"
          placeholder="Prenom"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInput
          label="Date de naissance"
          type="date"
          value={birthdate}
          onChange={(event) => setBirthdate(event.target.value)}
        />
        <TextInput
          label="Code postal"
          placeholder="Code postal"
          value={codePostal}
          onChange={(event) => setCodePostal(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInput
          label="Email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextInput
          label="Telephone"
          placeholder="Telephone"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextInput
          label="Mot de passe"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <SelectList
          label="Type"
          options={userTypeOptions}
          value={type}
          onChange={(event) => setType(event.target.value as UserType)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Checkbox
          label="Actif"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
        />
        <Checkbox
          label="Admin"
          checked={isAdmin}
          onChange={(event) => setIsAdmin(event.target.checked)}
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
          onClick={handleCreate}
          disabled={isSubmitting}
          className="rounded-lg bg-[var(--color-primary)] px-6 py-2 font-medium text-white transition-colors hover:bg-[var(--color-primary)]/90 disabled:opacity-50"
        >
          {isSubmitting ? "Creation en cours..." : "Creer"}
        </Button>

        <Button
          type="button"
          onClick={() => navigate("/users")}
          className="rounded-lg border border-[var(--color-primary)] bg-white px-6 py-2 font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/5"
        >
          Annuler
        </Button>
      </div>
    </section>
  );
};

export default CreateUser;
