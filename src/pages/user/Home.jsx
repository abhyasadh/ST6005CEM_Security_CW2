import React from 'react'

const Home = ({onLogout}) => {

  const handleLogout = (e) => {
    e.preventDefault();
    onLogout();
  };

  return (
    <div style={{padding: "60px", textAlign: "center"}}>
      <h1>Website is not available for DishDash as it requires user to scan QR on the table to order food. Please continue with our mobile application!</h1>
      <button style={{color: 'white', backgroundColor: "red", width: "200px", height: "50px", borderRadius: "20px", fontSize: "24px", marginTop: "40px"}} onClick={handleLogout}>Logout<i className="fas fa-sign-out-alt" style={{marginLeft:"30px"}}></i></button>
    </div>
  )
}

export default Home
