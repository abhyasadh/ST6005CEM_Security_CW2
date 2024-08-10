import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import History from './pages/admin/History';
import Orders from './pages/admin/Orders';
import Settings from './pages/admin/Settings';
import Menu from './pages/admin/Menu';
import Home from './pages/user/Home';
import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import socketIO from 'socket.io-client';

const socket = socketIO.connect('http://localhost:5000');

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    if (userData.isAdmin) {
      return <Navigate to="/History"/>
    } else {
      return <Navigate to="/home"/>
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    return <Navigate to="/login"/>
  };

  return (
    <Router>
      <ToastContainer position="top-center"/>
      {user && user.isAdmin && <Sidebar onLogout={handleLogout}/>}
      {user && user.isAdmin && <Navbar socket = {socket}/>}
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to={user.isAdmin ? '/orders' : '/home'} /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to={user.isAdmin ? '/orders' : '/home'} /> : <Login onLogin={handleLogin}/>}
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
          element={user && user.isAdmin ? <Orders socket = {socket}/> : <Navigate to="/login" />}
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
