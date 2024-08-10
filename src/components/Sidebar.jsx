import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({onLogout}) => {
  
  const [activeButton, setActiveButton] = useState('orders');
  const navigate = useNavigate();

  const handleButtonClick = (e, buttonName) => {
    e.preventDefault();
    setActiveButton(buttonName);
    navigate(`/${buttonName}`)
  };

  const handleLogout = (e) => {
    e.preventDefault();
    onLogout();
  };

  return (
    <>
      <div className="side">
        <ul>
          <li className="logo">
            <img src="../../assets/images/logo.png" alt="Logo" className="logo" />
          </li>
          <li>
            <a
              className={activeButton === "orders" ? "active" : ""}
              onClick={(e) => handleButtonClick(e, "orders")}
            >
              <div className="indicator"></div>
              <i className="fas fa-utensils"></i>
              <span className="nav-item">Orders</span>
            </a>
          </li>
          <li>
            <a
              className={activeButton === "menu" ? "active" : ""}
              onClick={(e) => handleButtonClick(e, "menu")}
            >
              <div className="indicator"></div>
              <i className="fas fa-hamburger"></i>
              <span className="nav-item">Menu</span>
            </a>
          </li>
          <li>
            <a
              className={activeButton === "history" ? "active" : ""}
              onClick={(e) => handleButtonClick(e, "history")}
            >
              <div className="indicator"></div>
              <i className="fas fa-history"></i>
              <span className="nav-item">History</span>
            </a>
          </li>
          <li>
            <a
              className={activeButton === "settings" ? "active" : ""}
              onClick={(e) => handleButtonClick(e, "settings")}
            >
              <div className="indicator"></div>
              <i className="fas fa-cog"></i>
              <span className="nav-item">Settings</span>
            </a>
          </li>
          <li>
            <a className="logout" onClick={(e) => handleLogout(e)}>
              <i className="fas fa-sign-out-alt"></i>
              <span className="nav-item">Logout</span>
            </a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
