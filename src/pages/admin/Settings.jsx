import React, { useState } from "react";
import { toast } from "react-toastify";
import { changePasswordApi } from "../../apis/API";

const Settings = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Function to validate the new password
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter.");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter.");
    }
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number.");
    }
    if (!/[!@#$%^&*()\-=+_{}[\]:;<>,.?/~]/.test(password)) {
      errors.push("Password must contain at least one special character.");
    }
    return errors;
  };

  const changePassword = (e) => {
    e.preventDefault();

    // Validate the new password
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      passwordErrors.forEach((error) => toast.error(error));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const passwordData = {
      currentPassword: oldPassword, newPassword: newPassword,
    };
    changePasswordApi(passwordData)
      .then((res) => {
        if (res.status === 400) {
          toast.error(res.data.message || "Password change unsuccessful!");
        } else {
          toast.success("Password changed successfully!");
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }
      })
      .catch((err) => {
        toast.error("Server error during password change.");
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
