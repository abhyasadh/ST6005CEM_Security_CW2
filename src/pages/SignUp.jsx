import React, { useState } from "react";
import { createUserApi, sendOTPApi, verifyOTPApi } from "../apis/API";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  //function for changing input value
  const changeFirstName = (e) => {
    setFirstName(e.target.value);
  };
  const changeLastName = (e) => {
    setLastName(e.target.value);
  };
  const changePhone = (e) => {
    setPhone(e.target.value);
  };
  const changePassword = (e) => {
    setPassword(e.target.value);
  };
  const changeConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
  };

  const genOTP = (e) => {
    e.preventDefault();

    const data = {
      phone: phone,
      purpose: "Signup",
    };

    sendOTPApi(data)
      .then((res) => {
        if (res.data.success === false) {
          toast.error("Error sending OTP!");
        } else {
          toast.success("OTP sent successfully!");
        }
      })
      .catch((err) => {
        toast.error("Server error!");
        console.log(err.message);
      });
  };

  const validateOTP = (e) => {
    e.preventDefault();
    const data = {
      otp: otp,
    };

    verifyOTPApi(data)
      .then((res) => {
        if (res.data.success === false) {
          toast.error("Invalid OTP!");
        } else {
          handleSubmit(e);
        }
      })
      .catch((err) => {
        toast.error("Server error!");
        console.log(err.message);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      password: password,
    };

    createUserApi(data)
      .then((res) => {
        if (res.data.success === false) {
          toast.error(res.data.message);
        } else {
          toast.success(res.data.message);
          navigate("/login")
        }
      })
      .catch((err) => {
        toast.error("Server error!");
        console.log(err.message);
      });
  };

  const validation = () => {
    let validationErrors = [];
    if (
      firstName === "" ||
      lastName === "" ||
      phone === "" ||
      password === "" ||
      confirmPassword === ""
    ) {
      validationErrors.push("All fields are required!");
      return validationErrors;
    }
    if (!firstName.match(/^[a-zA-Z]+$/)) {
      validationErrors.push("Invalid first name!");
    }
    if (!lastName.match(/^[a-zA-Z]+$/)) {
      validationErrors.push("Invalid last name!");
    }
    if (!phone.match(/^[0-9]+$/)) {
      validationErrors.push("Invalid phone number!");
    }
    if (!/[A-Z]/.test(password)) {
      validationErrors.push("Password must contain at least one uppercase letter.");
    }
    if (!/[a-z]/.test(password)) {
      validationErrors.push("Password must contain at least one lowercase letter.");
    }
    if (!/\d/.test(password)) {
      validationErrors.push("Password must contain at least one number.");
    }
    if (!/[!@#$%^&*()\-=+_{}[\]:;<>,.?/~]/.test(password)) {
      validationErrors.push("Password must contain at least one special character.");
    }
    if (password.length < 8) {
      validationErrors.push("Password must be at least 8 characters long.");
    }
    if (firstName && password.toLowerCase().includes(firstName.toLowerCase())) {
      validationErrors.push("Password should not contain your first name.");
    }
    if (lastName && password.toLowerCase().includes(lastName.toLowerCase())) {
      validationErrors.push("Password should not contain your last name.");
    }
    if (phone && password.includes(phone)) {
      validationErrors.push("Password should not contain your phone number.");
    }
    if (password !== confirmPassword) {
      validationErrors.push("Passwords don't match!");
    }
    return validationErrors;
  };

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
                <h2 className="fw-bold">Create an Account!</h2>
                <p>Embrace a Better Restaurant Experience!</p>
              </div>
              <div className="input-group mb-3">
                <input
                  onChange={changeFirstName}
                  type="text"
                  className="form-control form-control-lg bg-light fs-6 mt-3"
                  placeholder="First Name..."
                />
                <input
                  onChange={changeLastName}
                  type="text"
                  className="form-control form-control-lg bg-light fs-6 mt-3"
                  placeholder="Last Name..."
                />
              </div>
              <div className="input-group mb-3">
                <input
                  onChange={changePhone}
                  type="text"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Enter Your Phone Number..."
                />
              </div>
              <div className="input-group mb-3">
                <input
                  onChange={changePassword}
                  type="password"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Create a Password..."
                />
              </div>
              <div className="input-group mb-3">
                <input
                  onChange={changeConfirmPassword}
                  type="password"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Confirm Password..."
                />
              </div>
              <div className="input-group mb-3">
                <button
                  className="btn btn-lg btn-primary colored-button w-100 fs-8 fw-bold mt-2"
                  data-bs-toggle={validation().length===0 ? "modal" : null}
                  data-bs-target={validation().length===0 ? "#otpModal" : null}
                  onClick={(e) => {
                    if (validation().length !== 0) {
                      for (let i = 0; i < validation().length; i++) {
                        toast.error(validation()[i]);
                      }
                      return;
                    } else {
                      genOTP(e);
                    }
                  }}
                >
                  Create Account
                </button>
              </div>
              <div
                className="text-center"
                style={{ fontSize: "11px", color: "grey" }}
              >
                <small className="align-items-center ">
                  Already Have an Account?
                  <span className="ms-1">
                    <Link to={"/login"} className="forgot-password">
                      Login
                    </Link>
                  </span>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*================================ OTP Modal ============================*/}

      <div
        className="modal fade"
        id="otpModal"
        style={{ "--bs-modal-border-radius": "16px" }}
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
                  margin: "16px 0px 0px 0px",
                }}
              >
                Verification Code was sent to {phone}.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-lg colored-button w-100 fs-8 fw-bold"
                onClick={validateOTP}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
