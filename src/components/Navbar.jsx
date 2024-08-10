import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import { getRequestedTableApi } from "../apis/API";

const Navbar = ({ socket }) => {
  const [requests, setRequests] = useState([]);
  const [waiter, setWaiter] = useState([]);

  useEffect(() => {
    getRequestedTableApi().then((res) => {
      setRequests(res.data.tables.map((table) => table.tableNumber));
    });

    const handleTableRequest = (tableId) => {
      setRequests([...requests, tableId]);
      toast.info(`Table ${tableId} has requested menu!`);
    };

    const handleOrderRequest = (tableId) => {
      toast.info(`New Order Received for Table ${tableId}!`);
    };

    const handleWaiterRequest = (tableId) => {
      setWaiter([...waiter, tableId]);
      toast.error(`Table ${tableId} has requested a waiter!`);
    }

    socket.on("Table Request", handleTableRequest);
    socket.on("Waiter Requested", handleWaiterRequest);
    socket.on("New Order", handleOrderRequest);

    return () => {
      socket.off("Table Request", handleTableRequest);
      socket.off("Waiter Requested", handleWaiterRequest);
      socket.off("New Order", handleOrderRequest);
    };
  }, [socket]);

  return (
    <>
      <div className="navbar">
        <div className="box">
          <input type="text" placeholder="Search" />
          <button style={{ padding: "8px", backgroundColor: "white" }}>
            <i className="fas fa-search"></i>
          </button>
        </div>
        <div className="buttons" style={{ display: "flex" }}>
          <button
            className="nav-button"
            style={{ marginRight: "18px" }}
            data-bs-toggle="modal"
            data-bs-target="#waiterRequests"
          >
            {waiter.length !== 0 && (
              <span
                className="translate-middle badge rounded-pill"
                style={{
                  position: "absolute",
                  marginLeft: "30px",
                  marginTop: "-10px",
                  backgroundColor: "#ff6c44",
                }}
              >
                {waiter.length}
              </span>
            )}
            <i className="fas fa-user-tie"></i>
          </button>

          <button
            className="nav-button"
            style={{ marginRight: "18px" }}
            data-bs-toggle="modal"
            data-bs-target="#tableRequests"
          >
            {requests.length !== 0 && (
              <span
                className="translate-middle badge rounded-pill"
                style={{
                  position: "absolute",
                  marginLeft: "30px",
                  marginTop: "-10px",
                  backgroundColor: "#ff6c44",
                }}
              >
                {requests.length}
              </span>
            )}

            <i className="fas fa-hand-paper"></i>
          </button>
        </div>
      </div>

      <div
        className="modal fade"
        id="tableRequests"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
          style={{
            margin: "0px 0px 0px auto",
            width: "350px",
            height: "100%",
            borderRadius: "0px",
          }}
        >
          <div className="modal-content" style={{ height: "100%" }}>
            <div className="modal-header">
              <h5
                className="modal-title"
                id="exampleModalLabel"
                style={{ fontWeight: "bold" }}
              >
                Table Requests
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {requests && requests.map((tableNumber) => (
                <div key={tableNumber} className="table-request">
                  <p>Table {tableNumber} has requested menu.</p>
                  <div style={{ display: "flex", justifyContent: "end" }}>
                    <button
                      className="btn"
                      style={{
                        marginRight: "10px",
                        backgroundColor: "#8bc34a",
                        color: "white",
                      }}
                      onClick={ () => {
                        socket.emit("Accepted Table Request", tableNumber);
                        setRequests(requests.filter((table) => table !== tableNumber));
                      }}
                    >
                      Accept
                    </button>
                    <button
                      className="btn"
                      style={{ backgroundColor: "red", color: "white" }}
                      onClick={() => {
                        socket.emit("Declined Table Request", tableNumber);
                        setRequests(requests.filter((table) => table !== tableNumber));
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="waiterRequests"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
          style={{
            margin: "0px 0px 0px auto",
            width: "350px",
            height: "100%",
            borderRadius: "0px",
          }}
        >
          <div className="modal-content" style={{ height: "100%" }}>
            <div className="modal-header">
              <h5
                className="modal-title"
                id="exampleModalLabel"
                style={{ fontWeight: "bold" }}
              >
                Waiter Requests
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => {
                  setWaiter([]);
                }}
              ></button>
            </div>
            <div className="modal-body">
              {waiter.map((tableNumber) => (
                <div key={tableNumber} className="table-request">
                  <p style={{margin: "0px"}}>Table {tableNumber} has requested a waiter.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
