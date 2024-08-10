import React, { useState } from "react";
import { toast } from "react-toastify";
import { loginApi, recoverPasswordApi } from "../../apis/API";

const Settings = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = (e) => {
    e.preventDefault();

    const data = {
      phone: JSON.parse(localStorage.getItem("user")).phone,
      password: oldPassword,
    };

    loginApi(data)
      .then((res) => {
        if (res.data.success === false) {
          toast.error(res.data.message);
        } else {
          if (newPassword === confirmPassword) {
            const data = {
              password: newPassword,
            };
            recoverPasswordApi(JSON.parse(localStorage.getItem("user")).phone, data)
              .then((res) => {
                if (res.data.success === false) {
                  toast.error("Password change unsuccessful!");
                } else {
                  toast.success("Password changed successfully!");
                  setConfirmPassword("");
                  setNewPassword("");
                  setOldPassword("");
                }
              })
              .catch((err) => {
                toast.error("Server error!");
                console.log(err.message);
              });
          } else {
            toast.error("Passwords do not match!");
          }
        }
      })
      .catch((err) => {
        toast.error("Server error!");
        console.log(err.message);
      });
  };

  return (
    <>
      <div className="outer-container">
        <div className="categories">
          <div className="title-container">
            <span>Account Settings</span>
          </div>
          <div
            className="form-container"
            style={{ display: "flex", alignItems: "center" }}
          >
            <div className="form-field" style={{ marginRight: "20px" }}>
              <span style={{ marginLeft: "6px" }}>Current Password</span>
              <div className="input-group mb-3 mt-2">
                <input
                  onChange={(e) => setOldPassword(e.target.value)}
                  value={oldPassword}
                  type="password"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Current Password..."
                />
              </div>
            </div>
            <div className="form-field" style={{ marginRight: "20px" }}>
              <span style={{ marginLeft: "6px" }}>New Password</span>
              <div className="input-group mb-3 mt-2">
                <input
                  onChange={(e) => setNewPassword(e.target.value)}
                  value={newPassword}
                  type="password"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="New Password..."
                />
              </div>
            </div>
            <div className="form-field" style={{ marginRight: "20px" }}>
              <span style={{ marginLeft: "6px" }}>Confirm New Password</span>
              <div className="input-group mb-3 mt-2">
                <input
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  type="password"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Confirm New Password..."
                />
              </div>
            </div>
            <button
              className="btn"
              onClick={changePassword}
              style={{
                color: "white",
                backgroundColor: "#ff6c44",
                borderRadius: "12px",
                marginTop: "12px",
                padding: "8px 20px",
                fontWeight: "bold",
              }}
            >
              CHANGE PASSWORD
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
