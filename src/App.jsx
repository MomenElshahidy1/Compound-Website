import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { MantineProvider, createTheme } from "@mantine/core";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";

const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  fontFamily: "Segoe UI, sans-serif",
  headings: {
    fontFamily: "Segoe UI, sans-serif",
  },
});

// Layout
import Layout from "./Layouts/Layout";

// Public Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected Pages
import GroupChat from "./pages/GroupChat";
import PublicServices from "./pages/PublicServices";
import Advertisements from "./pages/Advertisements";
import Messages from "./pages/Messages";
import Conversation from "./pages/Conversation";

// Admin Pages
import PendingApprovals from "./pages/admin/PendingApprovals";
import ManageUsers from "./pages/admin/ManageUsers";
import ManagePublicServices from "./pages/admin/ManagePublicServices";
import LandingLayout from "./Layouts/LandingLayout";
import Landing from "./pages/Landing";

function App() {
  // Protected Route Component - moved inside App function
  const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  // Admin Route Component - moved inside App function
  const AdminRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!currentUser || !currentUser.is_admin) {
      return <Navigate to="/" />;
    }

    return children;
  };

  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              {/* <Route path="/" element={<LandingLayout/>} >
            </Route> */}
              <Route path="/" element={<Layout />}>
                {/* Public Routes */}
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />

                <Route
                  path="chat"
                  element={
                    <ProtectedRoute>
                      <GroupChat />
                    </ProtectedRoute>
                  }
                />
                {/* Protected Routes */}
                <Route index element={<Landing />} />
                <Route
                  path="public-services"
                  element={
                    <ProtectedRoute>
                      <PublicServices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="advertisements"
                  element={
                    <ProtectedRoute>
                      <Advertisements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="messages/:userId"
                  element={
                    <ProtectedRoute>
                      <Conversation />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="admin/pending"
                  element={
                    <AdminRoute>
                      <PendingApprovals />
                    </AdminRoute>
                  }
                />
                <Route
                  path="admin/users"
                  element={
                    <AdminRoute>
                      <ManageUsers />
                    </AdminRoute>
                  }
                />
                <Route
                  path="admin/public-services"
                  element={
                    <AdminRoute>
                      <ManagePublicServices />
                    </AdminRoute>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
