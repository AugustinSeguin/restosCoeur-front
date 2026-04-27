import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/generic";

const ErrorView = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState(
    "Une erreur est survenue pendant le chargement de l'application.",
  );

  useEffect(() => {
    const storedMessage = sessionStorage.getItem("errorMessage");

    if (storedMessage) {
      setMessage(storedMessage);
      sessionStorage.removeItem("errorMessage");
    }
  }, []);

  return (
    <main className="grid min-h-screen place-items-center px-5 py-8">
      <section className="grid w-full max-w-lg gap-4 rounded-2xl border-2 border-[var(--color-error)]/30 bg-white/80 p-6 text-center shadow-sm">
        <h1 className="m-0 text-2xl font-semibold text-[var(--color-error)]">
          Erreur
        </h1>
        <p className="m-0 text-sm text-[var(--color-text)]">{message}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-[var(--color-error)] text-white"
          >
            Retour
          </Button>
        </div>
      </section>
    </main>
  );
};

export default ErrorView;
