import type { ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Navbar from "./components/navbar/Navbar";
import Board from "./views/Board";
import Collection from "./views/Collection/Collection";
import Collections from "./views/Collection/Collections";
import CreateCollection from "./views/Collection/CreateCollection";
import Form from "./views/Form/Form";
import SuccessForm from "./views/Form/SuccessForm";
import CreateZone from "./views/Zone/CreateZone";
import CreateStore from "./views/Store/CreateStore";
import StoreEdit from "./views/Store/Store";
import Stores from "./views/Store/Stores";
import CreateUser from "./views/User/CreateUser";
import UserEdit from "./views/User/User";
import Users from "./views/User/Users";
import Zone from "./views/Zone/Zone";
import Zones from "./views/Zone/Zones";
import LoginPage from "./views/Login";
import "./App.css";

const FormPathRedirect = () => {
  const { id } = useParams();

  if (!id) {
    return <Navigate to="/form?collectionId=1" replace />;
  }

  return <Navigate to={`/form?collectionId=${id}`} replace />;
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
          <Route path="collections/create" element={<CreateCollection />} />
          <Route path="collections/:id" element={<Collection />} />
          <Route path="stores" element={<Stores />} />
          <Route path="stores/create" element={<CreateStore />} />
          <Route path="stores/:id" element={<StoreEdit />} />
          <Route path="zones" element={<Zones />} />
          <Route path="zones/create" element={<CreateZone />} />
          <Route path="zones/:id" element={<Zone />} />
          <Route path="users" element={<Users />} />
          <Route path="users/create" element={<CreateUser />} />
          <Route path="users/:id" element={<UserEdit />} />
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
