import type { ReactNode } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Navbar from "./components/navbar/Navbar";
import Board from "./views/Board";
import Collections from "./views/Collection/Collections";
import Form from "./views/Form/Form";
import SuccessForm from "./views/Form/SuccessForm";
import Stores from "./views/Store/Stores";
import Users from "./views/Users";
import Zones from "./views/Zone/Zones";
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
    <main className="grid min-h-screen place-items-center px-5 py-8">
      <div className="grid w-full max-w-md gap-4 rounded-md border-2 border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--bg-color)_85%,white_15%)] p-6 text-center">
        <h1 className="m-0 text-3xl font-semibold text-[var(--color-primary)]">
          Connexion
        </h1>
        <p className="m-0 text-[var(--color-text)]">
          Page de login temporaire.
        </p>
        <button
          type="button"
          onClick={() => login("demo-token")}
          className="rounded-md bg-[var(--color-primary)] px-4 py-2 font-medium text-white"
        >
          Se connecter
        </button>
        <p className="m-0">
          <Link to="/form?collectionId=1">Aller au formulaire public</Link>
        </p>
      </div>
    </main>
  );
};

const ProtectedLayout = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen w-full">
      <Navbar onLogout={logout} />
      <main className="w-full px-5 py-6">
        <Outlet />
      </main>
    </div>
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
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/board" replace />} />
          <Route path="board" element={<Board />} />
          <Route path="collections" element={<Collections />} />
          <Route path="stores" element={<Stores />} />
          <Route path="zones" element={<Zones />} />
          <Route path="users" element={<Users />} />
        </Route>
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? "/board" : "/form?collectionId=1"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
