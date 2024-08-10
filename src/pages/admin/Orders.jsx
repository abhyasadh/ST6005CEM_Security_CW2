import React, { useEffect, useState } from "react";
import {
  getTablesApi,
  getTableOrdersApi,
  updateOrderStatusApi,
  updatePaymentStatusApi,
  checkoutApi,
  getCheckedOutStatsApi,
} from "../../apis/API";
import { toast } from "react-toastify";

const Orders = ({ socket }) => {
  const [tables, setTables] = useState([]);
  const [bills, setBills] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedBills, setSelectedBills] = useState({});
  const [checkedOutCount, setCheckedOutCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  let fetchTableData = async () => {};

  useEffect(() => {
    fetchTableData = async () => {
      try {
        const res = await getTablesApi();
        console.log("Table data:", res.data);
        const tableNumbers = res.data.tables.map((table) => table.tableNumber);
        setTables(tableNumbers);

        const allOrders = [];
        for (const tableNumber of tableNumbers) {
          try {
            const orderRes = await getTableOrdersApi(tableNumber);
            if (orderRes.data.bill) {
              allOrders.push(orderRes.data.bill);
            }
          } catch (error) {
            console.error("Error fetching table orders:", error);
          }
        }
        setBills(allOrders);
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };

    fetchTableData();

    const handleNewOrder = () => {
      fetchTableData();
    };

    const fetchCheckedOutStats = async () => {
      try {
        const res = await getCheckedOutStatsApi();
        if (res.data.success) {
          setCheckedOutCount(res.data.count);
          setTotalAmount(res.data.totalAmount);
        } else {
          console.error("Error fetching checked out stats:", res.data.message);
        }
      } catch (error) {
        console.error("Error fetching checked out stats:", error);
      }
    };

    fetchCheckedOutStats();

    const handleCashPaymentRequest = async (tableId) => {
      toast.info(`Table ${tableId} requested for cash payment!`);
      await fetchTableData();
      let targetBill = bills.find((bill) => bill.tableId === tableId);
      if (targetBill) {
        targetBill.status = "CASH";
        setBills((prevBills) =>
          prevBills.map((bill) => {
            if (bill.tableId === tableId) {
              return targetBill;
            } else {
              return bill;
            }
          })
        );
      }
    };

    const handleOnlinePaymentRequest = async (tableId) => {
      toast.success(`Table ${tableId} paid online!`);
      await fetchTableData();
      let targetBill = bills.find((bill) => bill.tableId === tableId);
      if (targetBill) {
        targetBill.status = "PAID ONLINE";
        setBills((prevBills) =>
          prevBills.map((bill) => {
            if (bill.tableId === tableId) {
              return targetBill;
            } else {
              return bill;
            }
          })
        );
        setTotalAmount(totalAmount + targetBill.orders.reduce((total, order) => {
          return total + order.foodId.foodPrice * order.quantity;
        }, 0));
      }
    };

    socket.on("Table Request Accepted", () => {
      fetchTableData();
    });

    socket.on("Left Without Order", (tableId) => {
      fetchTableData();
    });

    socket.on("New Order", handleNewOrder);
    socket.on("Cash Payment Requested", handleCashPaymentRequest);
    socket.on("Online Paid", handleOnlinePaymentRequest);

    return () => {
      socket.off("New Order", handleNewOrder);
      socket.off("Left Without Order");
      socket.off("Table Request Accepted");
      socket.off("Cash Payment Requested", handleCashPaymentRequest);
      socket.off("Online Paid", handleOnlinePaymentRequest);
    };
  }, [socket]);

  useEffect(() => {
    if (tables.length > 0) {
      setSelectedTable(tables[0]);
    }
    if (bills.length > 0) {
      setSelectedBills(
        bills.find((bill) => bill.tableId === selectedTable) || []
      );
    }
  }, [tables, bills]);

  const handlePaymentReceived = async (tableId) => {
    const res = await updatePaymentStatusApi(selectedBills._id, {
      status: "PAID CASH",
    });
    if (res.data.success) {
      await fetchTableData();
      let targetBill = bills.find((bill) => bill.tableId === tableId);
      if (targetBill) {
        targetBill.status = "PAID CASH";
        setBills((prevBills) =>
          prevBills.map((bill) => {
            if (bill.tableId === tableId) {
              return targetBill;
            } else {
              return bill;
            }
          })
        );
        setTotalAmount(totalAmount + targetBill.orders.reduce((total, order) => {
          return total + order.foodId.foodPrice * order.quantity;
        }, 0));
      }
    } else {
      toast.error("Error receiving payment!");
    }
  };

  const handleTableChange = (tableId) => {
    setSelectedTable(tableId);
    setSelectedBills(bills.find((bill) => bill.tableId === tableId) || {});
  };

  const handleMarkAs = (billId, orderItemId, status) => {
    updateOrderStatusApi(billId, { orderItemId, status }).then((res) => {
      if (res.data.success) {
        const updatedBills = bills.map((bill) => {
          if (bill._id === billId) {
            return {
              ...bill,
              orders: bill.orders.map((order) => {
                if (order._id === orderItemId) {
                  return { ...order, status: status };
                } else {
                  return order;
                }
              }),
            };
          } else {
            return bill;
          }
        });
        setBills(updatedBills);
      }
    });
  };

  const handleCheckout = async (billId) => {
    const res = await checkoutApi(billId, {});
    if (res.data.success) {
      setBills((prevBills) =>
        prevBills.filter((bill) => bill.tableId !== selectedTable)
      );
      setTables((prevTables) => prevTables.filter((table) => table !== selectedTable));
      if (tables.length > 0) {
        setSelectedTable(tables[0]);
        const selectedBill = bills.find((bill) => bill.tableId === tables[0]);
        setSelectedBills(selectedBill || {});
      } else {
        setSelectedBills({});
      }
      setCheckedOutCount(checkedOutCount + 1);
    } else {
      toast.error("Error checking out!");
    }
  };
  

  const countOrderStatus = (status) => {
    let totalCount = 0;
    if (bills != null && bills.length > 0) {
      for (const bill of bills) {
        for (const order of bill.orders) {
          if (order.status === status) {
            totalCount++;
          }
        }
      }
      return totalCount.toString();
    } else {
      return "0";
    }
  };

  return (
    <>
      <div className="outer-container">
        <div className="categories">
          <div className="category-item-container">
            <div className="stats-container">
              <div
                className="stats-icon"
                style={{ backgroundColor: "#ff5e5e80" }}
              >
                <i className="fas fa-eye-slash" style={{ color: "red" }}></i>
              </div>
              <div className="stats-detail">
                <span className="number" style={{ color: "red" }}>
                  {countOrderStatus("Unseen")}
                </span>
                <span className="name">Unseen</span>
              </div>
            </div>
            <div className="stats-container">
              <div
                className="stats-icon"
                style={{ backgroundColor: "#ff6c4480" }}
              >
                <i
                  className="fas fa-hourglass-half"
                  style={{ color: "#ff6c44" }}
                ></i>
              </div>
              <div className="stats-detail">
                <span className="number" style={{ color: "#ff6c44" }}>
                  {countOrderStatus("Seen")}
                </span>
                <span className="name">Ongoing</span>
              </div>
            </div>
            <div className="stats-container">
              <div
                className="stats-icon"
                style={{ backgroundColor: "#4ABCC370" }}
              >
                <i
                  className="fas fa-check-circle"
                  style={{ color: "#4ABCC3" }}
                ></i>
              </div>
              <div className="stats-detail">
                <span className="number" style={{ color: "#4ABCC3" }}>
                  {countOrderStatus("Completed")}
                </span>
                <span className="name">Completed</span>
              </div>
            </div>
            <div className="stats-container">
              <div
                className="stats-icon"
                style={{ backgroundColor: "#8bc34a80" }}
              >
                <i
                  className="fas fa-hand-holding-usd"
                  style={{ color: "#8bc34a" }}
                ></i>
              </div>
              <div className="stats-detail">
                <span className="number" style={{ color: "#8bc34a" }}>
                  {checkedOutCount}
                </span>
                <span className="name">Checked Out</span>
              </div>
            </div>
            <div className="stats-container">
              <div
                className="stats-icon"
                style={{ backgroundColor: "#00c11380" }}
              >
                <i
                  className="fas fa-money-bill-wave"
                  style={{ color: "#00c113" }}
                ></i>
              </div>
              <div className="stats-detail">
                <div className="price">
                  <div style={{ marginTop: "6px" }}>
                    <span
                      className="currency"
                      style={{ color: "#00c113", fontSize: "16px" }}
                    >
                      Rs.
                    </span>
                  </div>
                  <span
                    className="amount"
                    style={{ color: "#00c113", fontSize: "28px" }}
                  >
                    {totalAmount.toLocaleString()}
                  </span>
                </div>
                <span className="name">Amount</span>
              </div>
            </div>
          </div>
        </div>

        {tables != null && tables.length > 0 ? (
          <div className="food-items" style={{ padding: "26px" }}>
            {selectedBills &&
            selectedBills.orders &&
            selectedBills.orders.length !== 0 ? (
              <div
                className="order-table"
                style={{
                  justifyContent: "center",
                  flex: "2",
                  marginRight: "26px",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      fontSize: "30px",
                      fontWeight: "bold",
                      textDecoration: "underline",
                      color: "#ff6c44",
                    }}
                  >
                    Table: {selectedTable}
                  </span>
                  {(selectedBills.status === "PAID CASH" ||
                    selectedBills.status === "PAID ONLINE") &&
                    selectedBills.orders.every(
                      (order) => order.status === "Completed"
                    ) && (
                      <button
                        style={{
                          padding: "6px 14px",
                          borderRadius: "14px",
                          color: "rgb(139, 195, 74)",
                          border: "2px solid rgb(139, 195, 74)",
                          backgroundColor: "rgba(139, 195, 74, 0.5",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                        onClick={() => handleCheckout(selectedBills._id)}
                      >
                        Checked Out ?
                      </button>
                    )}
                </div>

                <table className="table" style={{ marginTop: "20px" }}>
                  <thead>
                    <tr>
                      <th scope="col">S. No.</th>
                      <th scope="col">Food Item</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Unit Price</th>
                      <th scope="col">Total Price</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBills.orders &&
                      selectedBills.orders.length > 0 &&
                      selectedBills.orders.map((order, index) => (
                        <tr key={index}>
                          <th scope="row">{index + 1}</th>
                          <td>{order.foodId.foodName}</td>
                          <td>{order.quantity}</td>
                          <td>{order.foodId.foodPrice}</td>
                          <td>{order.foodId.foodPrice * order.quantity}</td>
                          <td scope="row">
                            {order.status === "Unseen" && (
                              <button
                                onClick={() =>
                                  handleMarkAs(
                                    selectedBills._id,
                                    order._id,
                                    "Seen"
                                  )
                                }
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  padding: "3px 6px",
                                  borderRadius: "8px",
                                  backgroundColor: "rgba(255, 108, 68, 0.5)",
                                  color: "rgb(255, 108, 68)",
                                  border: "2px solid rgb(255, 108, 68)",
                                }}
                              >
                                Mark as Ongoing
                              </button>
                            )}
                            {order.status === "Seen" && (
                              <button
                                onClick={() =>
                                  handleMarkAs(
                                    selectedBills._id,
                                    order._id,
                                    "Completed"
                                  )
                                }
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  padding: "3px 6px",
                                  borderRadius: "8px",
                                  backgroundColor: "rgba(74, 188, 195, 0.44)",
                                  color: "rgb(74, 188, 195)",
                                  border: "2px solid rgb(74, 188, 195)",
                                }}
                              >
                                Mark as Completed
                              </button>
                            )}
                            {order.status === "Completed" && (
                              <button
                                disabled
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  padding: "3px 6px",
                                  borderRadius: "8px",
                                  backgroundColor: "rgba(128, 128, 128, 0.5)",
                                  border: "2px solid grey",
                                  color: "grey",
                                }}
                              >
                                Completed
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <thead>
                    <tr>
                      <th scope="col"></th>
                      <th scope="col"></th>
                      <th scope="col"></th>
                      <th scope="col">Total:</th>
                      <th scope="col">
                        Rs.{" "}
                        {selectedBills.orders &&
                          selectedBills.orders.reduce((total, order) => {
                            return (
                              total + order.foodId.foodPrice * order.quantity
                            );
                          }, 0)}
                      </th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <thead>
                    <tr>
                      <th scope="col"></th>
                      <th scope="col"></th>
                      <th scope="col"></th>
                      <th scope="col">Payment:</th>
                      <th
                        scope="col"
                        style={
                          selectedBills.status === "NOT PAID"
                            ? { color: "red" }
                            : selectedBills.status === "CASH"
                            ? { color: "rgb(74, 188, 195)" }
                            : { color: "rgb(0, 193, 19)" }
                        }
                      >
                        {selectedBills.status}
                      </th>
                      <th scope="col">
                        {selectedBills.status === "CASH" && (
                          <button
                            onClick={() =>
                              handlePaymentReceived(selectedBills.tableId)
                            }
                            style={{
                              fontSize: "12px",
                              fontWeight: "bold",
                              padding: "3px 6px",
                              borderRadius: "8px",
                              backgroundColor: "rgba(0, 193, 19, 0.5)",
                              color: "rgb(0, 193, 19)",
                              border: "2px solid rgb(0, 193, 19)",
                            }}
                          >
                            Received?
                          </button>
                        )}
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
            ) : (
              <div style={{ flex: "2", margin: "auto", textAlign: "center" }}>
                <h3>No Orders Yet!</h3>
              </div>
            )}
            <div
              className="table-arrangement"
              style={{
                flex: "1",
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                borderLeft: "1px solid grey",
                paddingLeft: "26px",
              }}
            >
              <h5
                style={{
                  paddingBottom: "10px",
                  color: "#ff6c44",
                  textDecoration: "underline",
                  fontWeight: "bold",
                }}
              >
                Occupied Tables
              </h5>
              <div className="table-container" style={{ display: "flex" }}>
                {tables.map((table) => {
                  const bill =
                    bills.find((bill) => bill.tableId === table) || {};
                  let tableStatus;
                  if (bill.orders && bill.orders.length > 0) {
                    if (
                      bill.orders.every((order) => order.status === "Completed")
                    ) {
                      tableStatus = "completed";
                    } else if (
                      bill.orders.some((order) => order.status === "Unseen")
                    ) {
                      tableStatus = "unseen";
                    } else {
                      tableStatus = "seen";
                    }
                  } else {
                    tableStatus = "completed";
                  }

                  const isActive = selectedTable === table;
                  const classes = `each-table ${
                    isActive ? "active" : ""
                  } ${tableStatus}`;

                  return (
                    <div
                      key={table}
                      className={classes}
                      onClick={() => handleTableChange(table)}
                    >
                      <div className="table-number">{table}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="food-items" style={{ padding: "26px" }}>
            <h3 style={{ margin: "auto" }}>No tables occuppied!</h3>
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;
