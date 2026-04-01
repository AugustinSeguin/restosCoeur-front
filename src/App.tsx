import type { ReactNode } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Form from "./views/Form/Form";
import SuccessForm from "./views/Form/SuccessForm";
import "./App.css";

const FormPathRedirect = () => {
  const { id } = useParams();

  if (!id) {
    return <Navigate to="/form?collectionId=1" replace />;
  }

  return <Navigate to={`/form?collectionId=${id}`} replace />;
};

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Connexion</h1>
      <p>Page de login temporaire.</p>
      <button type="button" onClick={() => login("demo-token")}>
        Se connecter
      </button>
      <p>
        <Link to="/form?collectionId=1">Aller au formulaire public</Link>
      </p>
    </main>
  );
};

const PrivateHome = () => {
  const { logout } = useAuth();

  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Espace prive</h1>
      <p>Route protegee active.</p>
      <p>
        <Link to="/form?collectionId=1">Formulaire public</Link>
      </p>
      <button type="button" onClick={logout}>
        Se deconnecter
      </button>
    </main>
  );
};

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/form" element={<Form />} />
        <Route path="/form/success" element={<SuccessForm />} />
        <Route path="/form/:id" element={<FormPathRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PrivateHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? "/" : "/form?collectionId=1"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
