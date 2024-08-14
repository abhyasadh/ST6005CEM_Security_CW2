import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import History from './pages/admin/History';
import Orders from './pages/admin/Orders';
import Settings from './pages/admin/Settings';
import Menu from './pages/admin/Menu';
import Home from './pages/user/Home';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import socketIO from 'socket.io-client';
import { sessionApi, logoutApi, getCsrfTokenApi } from './apis/API';

const socket = socketIO.connect('https://localhost:5000', {
  withCredentials: true
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);

  useEffect(() => {
    const fetchSessionAndCsrfToken = async () => {
      try {
        // Fetch the CSRF token
        const csrfResponse = await getCsrfTokenApi();
        setCsrfToken(csrfResponse.data.csrfToken);

        // Fetch session details
        const sessionResponse = await sessionApi();
        if (sessionResponse.data.success) {
          setUser(sessionResponse.data.user);
        }
      } catch (error) {
        console.log("No active session or failed to fetch CSRF token.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndCsrfToken();
  }, []);

  const handleLogin = async (userData) => {
    setUser(userData);
    toast.success("Login Successful!");

    if (userData.isAdmin) {
      return <Navigate to="/orders" />;
    } else {
      return <Navigate to="/home" />;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
      setUser(null);
      toast.success("Logged out successfully!");
      return <Navigate to="/login" />;
    } catch (error) {
      toast.error("Error logging out!");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <ToastContainer position="top-center" />
      {user && user.isAdmin && <Sidebar onLogout={handleLogout} />}
      {user && user.isAdmin && <Navbar socket={socket} />}
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to={user.isAdmin ? '/orders' : '/home'} /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to={user.isAdmin ? '/orders' : '/home'} /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to={user.isAdmin ? '/orders' : '/home'} /> : <SignUp />}
        />

        {/*============================================ User Routes ================================================*/}
        <Route
          path="/home"
          element={user ? <Home onLogout={handleLogout} /> : <Navigate to="/login" />}
        />

        {/*============================================ Admin Routes ===============================================*/}
        <Route
          path="/history"
          element={user && user.isAdmin ? <History /> : <Navigate to="/login" />}
        />
        <Route
          path="/orders"
          element={user && user.isAdmin ? <Orders socket={socket} /> : <Navigate to="/login" />}
        />
        <Route
          path="/menu"
          element={user && user.isAdmin ? <Menu /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={user && user.isAdmin ? <Settings /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
