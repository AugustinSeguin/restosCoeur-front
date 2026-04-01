import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/generic";

const SuccessForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const collectionTitle =
    (location.state as { collectionTitle?: string })?.collectionTitle ||
    "Collecte";
  const collectionId = searchParams.get("collectionId") || "1";

  return (
    <section className="flex min-h-screen w-full flex-col items-stretch justify-center pb-6 pt-2">
      <div className="grid w-full gap-4 rounded-md border-2 border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--bg-color)_85%,white_15%)] px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="m-0 text-center text-3xl font-semibold text-[var(--color-primary)]">
          Merci !
        </h1>

        <p className="m-0 text-center text-lg font-bold text-[var(--color-secondary)]">
          {collectionTitle}
        </p>

        <p className="m-0 text-center text-sm text-[var(--color-text)]">
          Votre formulaire a été soumis avec succès. Nous remercions pour votre
          participation aux{" "}
          <span className="font-semibold">Restos du Cœur</span>.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/form?collectionId=${collectionId}`)}
          >
            Remplir un autre formulaire
          </Button>
          <Button type="button" variant="primary" onClick={() => navigate("/")}>
            Retour
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SuccessForm;
