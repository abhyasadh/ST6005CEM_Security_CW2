import React, { useState } from "react";
import { findUserApi, loginApi, recoverPasswordApi, sendOTPApi, verifyOTPApi } from "../apis/API";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      phone: phone,
      password: password,
    };

    loginApi(data)
      .then((res) => {
        if (res.data.success === false) {
          toast.error(res.data.message);
        } else {
          onLogin(res.data.userData);
        }
      })
      .catch((err) => {
        toast.error("Server error!");
        console.log(err.message);
      });
  };


  //===============================================Forgot Password===================================================

  const [recoveryNumber, setRecoveryNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [confirmRecoveryPassword, setConfirmRecoveryPassword] = useState("");

  const genOTP = (e) => {
    e.preventDefault();

    const data = {
      phone : recoveryNumber,
      purpose : "Reset"
    }
    
    sendOTPApi(data).then((res) => {
      if (res.data.success === false) {
        toast.error("User not found!");
      } else {
        toast.success("OTP sent successfully!");
      }
    }).catch((err) => {
      toast.error("Server error!");
      console.log(err.message);
    });
  };

  const validateOTP = (e) => {
    e.preventDefault();
    const data = {
      otp: otp
    }

    verifyOTPApi(data).then((res) => {
      if (res.data.success === false) {
        toast.error("Invalid OTP!");
      } else {
        toast.success("OTP verified successfully!");
      }
    }).catch((err) => {
      toast.error("Server error!");
      console.log(err.message);
    });
  }

  const changePassword = (e) => {
    e.preventDefault();
    if (recoveryPassword === confirmRecoveryPassword) {
      const data = {
        password: recoveryPassword
      }
      recoverPasswordApi(recoveryNumber, data).then((res) => {
        if (res.data.success === false) {
          toast.error("User not found!");
        } else {
          toast.success("Password changed successfully!");
        }
      }).catch((err) => {
        toast.error("Server error!");
        console.log(err.message);
      });
    } else {
      toast.error("Passwords do not match!");
    }
  }

  return (
    <div
      style={{
        backgroundImage: "url('../../assets/images/background.jpg')",
        backgroundRepeat: "repeat",
        backgroundSize: "400px 400px",
      }}
    >
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="row border rounded-5 p-3 col-md-6 bg-white shadow box-area d-flex align-items-stretch">
          <div className="right-box">
            <div className="row align-items-center">
              <div className="header-text mt-2 text-center">
                <h2 className="fw-bold">Welcome Back, Foodie!</h2>
                <p>Enjoy a Better Restaurant Experience!</p>
              </div>
              <div className="input-group mb-3">
                <input
                  onChange={(e) => setPhone(e.target.value)}
                  type="text"
                  className="form-control form-control-lg bg-light fs-6 mt-3"
                  placeholder="Enter Your Phone Number..."
                />
              </div>
              <div className="input-group mb-3">
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Enter Your Password..."
                />
              </div>
              <div className="input-group mb-4 d-flex justify-content-between">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="formCheck"
                    style={{ borderColor: "#ff6c44" }}
                  />
                  <label
                    className="form-check-label text-secondary"
                  >
                    <small>Remember Me</small>
                  </label>
                </div>
                <div className="forgot">
                  <small>
                    <a
                      className="forgot-password"
                      data-bs-toggle="modal"
                      data-bs-target="#phoneNumberModal"
                      style={{ cursor: "pointer" }}
                    >
                      Forgot Password?
                    </a>
                  </small>
                </div>
              </div>
              <div style={{ height: "2.67px" }}></div>
              <div className="input-group mb-4">
                <button
                  className="btn btn-lg colored-button w-100 fs-8 fw-bold"
                  onClick={handleSubmit}
                >
                  Login
                </button>
              </div>
              <div className="input-group mb-3">
                <button className="btn btn-lg btn-light w-100 fs-8">
                  <img
                    src={process.env.PUBLIC_URL + "/assets/images/google.png"}
                    alt="Google"
                    style={{ width: "20px" }}
                    className="me-2"
                  />
                  <small>Sign In with Google</small>
                </button>
              </div>
              <div
                className="text-center"
                style={{ fontSize: "11px", color: "grey" }}
              >
                <small className="align-items-center ">
                  Don't Have an Account?
                  <span className="ms-1">
                    <Link
                      to={"/signup"}
                      className="forgot-password"
                      style={{ cursor: "pointer" }}
                    >
                      Sign Up
                    </Link>
                  </span>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*================================ Phone Number Modal ============================*/}

      <div
        className="modal fade"
        id="phoneNumberModal"
        style={{"--bs-modal-border-radius": "16px"}}
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">
                Forgot Password?
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="input-group ">
                <input
                  onChange={(e) => setRecoveryNumber(e.target.value)}
                  type="text"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Enter Your Phone Number..."
                />
              </div>
              <p
                style={{
                  backgroundColor: "#a4e1f6",
                  color: "#37B5DF",
                  padding: "8px 12px",
                  fontSize: "12px",
                  borderRadius: "10px",
                  margin: "16px 0px 0px 0px"
                }}
              >
                Note: This phone number will be used to send a verification code.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                data-bs-dismiss="modal"
                data-bs-toggle="modal"
                data-bs-target="#otpModal"
                className="btn btn-lg colored-button w-100 fs-8 fw-bold"
                onClick={genOTP}
              >
                Send OTP
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*================================ OTP Modal ============================*/}

      <div
        className="modal fade"
        id="otpModal"
        style={{"--bs-modal-border-radius": "16px"}}
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                OTP Verification
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="input-group ">
                <input
                  onChange={(e) => setOtp(e.target.value)}
                  type="text"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Enter the OTP..."
                />
              </div>
              <p
                style={{
                  backgroundColor: "#a4e1f6",
                  color: "#37B5DF",
                  padding: "8px 12px",
                  fontSize: "12px",
                  borderRadius: "10px",
                  margin: "16px 0px 0px 0px"
                }}
              >
                Verification Code was sent to {recoveryNumber}
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                data-bs-dismiss="modal"
                data-bs-toggle="modal"
                data-bs-target="#passwordModal"
                className="btn btn-lg colored-button w-100 fs-8 fw-bold"
                onClick={validateOTP}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*================================ Password Modal ============================*/}

      <div
        className="modal fade"
        id="passwordModal"
        style={{"--bs-modal-border-radius": "16px"}}
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="staticBackdropLabel">
                New Password
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
            <div className="input-group mb-3">
                <input
                  onChange={(e) => setRecoveryPassword(e.target.value)}
                  type="password"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Create New Password..."
                />
              </div>
              <div className="input-group">
                <input
                  onChange={(e) => setConfirmRecoveryPassword(e.target.value)}
                  type="password"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Confirm Password..."
                />
              </div>
              
            </div>

            <div className="modal-footer">
              <button
                type="button"
                data-bs-dismiss="modal"
                className="btn btn-lg colored-button w-100 fs-8 fw-bold"
                onClick={changePassword}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
