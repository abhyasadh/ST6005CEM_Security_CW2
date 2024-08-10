import React, { useEffect, useState, useRef } from "react";
import { getHistoryApi } from "../../apis/API";

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showCash, setShowCash] = useState(true);
  const [showOnline, setShowOnline] = useState(true);
  const [totalMin, setTotalMin] = useState(0);
  const [quantityMin, setQuantityMin] = useState(1);

  useEffect(() => {
    fetchHistory(selectedDate);
  }, [selectedDate]);

  const fetchHistory = async (date) => {
    try {
      const res = await getHistoryApi(date);
      if (res.data.success) {
        setHistoryData(res.data.bills);
      } else {
        console.error("Error fetching history:", res.data.message);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleCashCheckboxChange = (e) => {
    setShowCash(e.target.checked);
  };

  const handleOnlineCheckboxChange = (e) => {
    setShowOnline(e.target.checked);
  };

  const handleTotalMinChange = (e) => {
    setTotalMin(parseInt(e.target.value) * 500);
  };

  const handleQuantityMinChange = (e) => {
    setQuantityMin(parseInt(e.target.value));
  };

  const filterHistoryData = () => {
    return historyData.filter((item) => {
      if (
        (item.status === "PAID CASH" && !showCash) ||
        (item.status === "PAID ONLINE" && !showOnline)
      ) {
        return false;
      }

      const totalAmount = item.orders.reduce((total, order) => {
        return total + order.foodId.foodPrice * order.quantity;
      }, 0);
      if (totalAmount < totalMin) {
        return false;
      }

      const totalQuantity = item.orders.reduce((total, order) => {
        return total + order.quantity;
      }, 0);
      if (totalQuantity < quantityMin) {
        return false;
      }

      return true;
    });
  };

  const calculateTotalSum = () => {
    let totalSum = 0;
    filterHistoryData().forEach((item) => {
      const sum = item.orders.reduce((acc, order) => {
        return acc + order.foodId.foodPrice * order.quantity;
      }, 0);
      totalSum += sum;
    });
    return totalSum.toLocaleString();
  };

  const convertToCSV = (csvContent) => {
    return encodeURI("data:text/csv;charset=utf-8," + csvContent);
  };
  
  const billsToCSV = (bills) => {
    let csvContent =
      "_id,userId,tableId,status,time,checkout,foodId,quantity,orderStatus\n";
  
    bills.forEach((bill) => {
      const {_id, userId, tableId, status, time, checkout, orders } = bill;
  
      orders.forEach((order) => {
        const orderRow = `${_id},${userId},${tableId},${status},${time},${checkout},${order.foodId.foodName},${order.quantity},${order.status}\n`;
        csvContent += orderRow;
      });
    });
  
    return csvContent;
  };
  
  const handleDownload = () => {
    const filteredData = filterHistoryData();
    const csvContent = billsToCSV(filteredData);
    const csvData = convertToCSV(csvContent);
  
    const link = document.createElement("a");
    link.setAttribute("href", csvData);
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <>
      <div className="outer-container">
        <div className="food-items" style={{ marginTop: "16px" }}>
          <div
            className="order-table"
            style={{ justifyContent: "center", flex: "2", marginRight: "26px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: "30px",
                  fontWeight: "bold",
                  textDecoration: "underline",
                  color: "#ff6c44",
                }}
              >
                History
              </span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  Count: {filterHistoryData().length}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  Total: Rs.
                  {" "+calculateTotalSum()}
                </span>
              </div>
            </div>
            <ul style={{ listStyleType: "none", padding: "0px" }}>
              {filterHistoryData().map((item, index) => (
                <li key={index}>
                  <div
                    style={{
                      backgroundColor: "#eee",
                      padding: "0px",
                      marginTop: "20px",
                      marginBottom: "26px",
                      padding: "20px",
                      borderRadius: "24px",
                    }}
                  >
                    <table className="table">
                      <thead>
                        <tr>
                          <th scope="col">S. No.</th>
                          <th scope="col">Food Item</th>
                          <th scope="col">Quantity</th>
                          <th scope="col">Unit Price</th>
                          <th scope="col">Total Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.orders.length > 0 &&
                          item.orders.map((order, index) => (
                            <tr key={index}>
                              <th scope="row">{index + 1}</th>
                              <td>{order.foodId.foodName}</td>
                              <td>{order.quantity}</td>
                              <td>{order.foodId.foodPrice}</td>
                              <td>{order.foodId.foodPrice * order.quantity}</td>
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
                            {item.orders &&
                              item.orders.reduce((total, order) => {
                                return (
                                  total +
                                  order.foodId.foodPrice * order.quantity
                                );
                              }, 0)}
                          </th>
                        </tr>
                      </thead>
                      <thead>
                        <tr>
                          <th scope="col"></th>
                          <th scope="col"></th>
                          <th scope="col"></th>
                          <th scope="col">Payment:</th>
                          <th scope="col" style={{ color: "rgb(0, 193, 19)" }}>
                            {item.status}
                          </th>
                        </tr>
                      </thead>
                      <thead>
                        <tr>
                          <th scope="col"></th>
                          <th scope="col"></th>
                          <th scope="col"></th>
                          <th scope="col">Time:</th>
                          <th scope="col">
                            {new Date(item.time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="table-arrangement"
            style={{
              flex: "1",
              display: "flex",
              flexDirection: "column",
              borderLeft: "1px solid grey",
              padding: "0px 26px",
              marginBottom: "20px",
            }}
          >
            <h5
              style={{
                paddingBottom: "10px",
                color: "#ff6c44",
                textDecoration: "underline",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Filters
            </h5>
            <div className="filter-container">
              <div className="filter-name">
                <label htmlFor="date">Date:</label>
              </div>
              <div className="filter-value">
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={handleDateChange}
                />
              </div>
            </div>
            <div className="filter-container">
              <div className="filter-name">Payment Method:</div>
              <div className="filter-value">
                <div className="filter-container">
                  <label htmlFor="cash" style={{ marginRight: "10px" }}>
                    Cash:
                  </label>
                  <input
                    type="checkbox"
                    id="cash"
                    checked={showCash}
                    onChange={handleCashCheckboxChange}
                  />
                </div>
                <div className="filter-container">
                  <label htmlFor="online" style={{ marginRight: "10px" }}>
                    Online:
                  </label>
                  <input
                    type="checkbox"
                    id="online"
                    checked={showOnline}
                    onChange={handleOnlineCheckboxChange}
                  />
                </div>
              </div>
            </div>
            <div className="filter-container">
              <div className="filter-name">
                <label htmlFor="totalMin">Total (Rs.):</label>
              </div>
              <div className="filter-value">
                <input
                  type="range"
                  id="totalMin"
                  min="0"
                  max="14"
                  value={totalMin / 500}
                  onChange={handleTotalMinChange}
                />
                <span>{totalMin}</span>
              </div>
            </div>
            <div className="filter-container">
              <div className="filter-name">
                <label htmlFor="quantityMin">Quantity:</label>
              </div>
              <div className="filter-value">
                <input
                  type="range"
                  id="quantityMin"
                  min="1"
                  max="7"
                  value={quantityMin}
                  onChange={handleQuantityMinChange}
                />
                <span>{quantityMin}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn"
              style={{
                color: "white",
                backgroundColor: "#ff6c44",
                width: "100%",
                borderRadius: "12px",
                marginTop: "12px",
              }}
              onClick={handleDownload}
            >
              <i
                className="fas fa-download"
                style={{ marginRight: "6px", fontSize: "14px" }}
              ></i>
              Download Filtered Data
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default History;
