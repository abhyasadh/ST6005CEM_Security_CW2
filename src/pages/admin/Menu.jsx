import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  categoryUnavailableApi,
  createCategoryApi,
  createFoodApi,
  deleteCategoryApi,
  deleteFoodApi,
  foodUnavailableApi,
  getAllCategoriesApi,
  getAllFoodsApi,
  updateCategoryApi,
  updateFoodApi,
} from "../../apis/API";

const Menu = () => {
  const [foods, setFoods] = useState([]);
  const [activeFoods, setActiveFoods] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getAllCategoriesApi().then((res) => {
      if (res.data.categories.length > 0) {
      setCategories(res.data.categories);
      setActiveButton(res.data.categories[0].categoryName);
      setEditId(res.data.categories[0]._id);
      setEditName(res.data.categories[0].categoryName);
      setEditImage(res.data.categories[0].categoryImageUrl);
      setEditPreviewImage(res.data.categories[0].categoryImageUrl);
      setCategoryActive(res.data.categories[0].status);
    }});

    setActiveFoods(
      foods.filter((food) => food.foodCategory === categories[0]._id)
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const foodResponse = await getAllFoodsApi();
        setFoods(foodResponse.data.foods);

        const categoriesResponse = await getAllCategoriesApi();
        setCategories(categoriesResponse.data.categories);

        setActiveButton(categoriesResponse.data.categories[0].categoryName);
        setEditId(categoriesResponse.data.categories[0]._id);
        setEditName(categoriesResponse.data.categories[0].categoryName);
        setEditImage(categoriesResponse.data.categories[0].categoryImageUrl);
        setEditPreviewImage(
          categoriesResponse.data.categories[0].categoryImageUrl
        );
        setCategoryActive(categoriesResponse.data.categories[0].status);

        setActiveFoods(
          foodResponse.data.foods.filter(
            (food) =>
              food.foodCategory === categoriesResponse.data.categories[0]._id
          )
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  //===================================================Logic for Category====================================================//

  //===========Manage Button State===========//
  const [activeButton, setActiveButton] = useState("");

  const handleButtonClick = (e, buttonName) => {
    e.preventDefault();
    setActiveButton(buttonName);
  };

  //===========Add Category Logic===========//
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setCategoryImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("categoryName", categoryName);
    formData.append("categoryImage", categoryImage);

    createCategoryApi(formData)
      .then((res) => {
        if (res.data.success === false) {
          toast.error(res.data.message);
        } else {
          toast.success(res.data.message);
          setCategories(categories.concat(res.data.data));
        }
      })
      .catch((err) => {
        toast.error("Server Error");
        console.log(err.message);
      });
  };

  //===========Edit Category Logic===========//
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editPreviewImage, setEditPreviewImage] = useState(null);
  const [categoryActive, setCategoryActive] = useState(null);

  const handleEditImageUpload = (event) => {
    const file = event.target.files[0];
    setEditImage(file);
    setEditPreviewImage(URL.createObjectURL(file));
  };

  const handleEdit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("categoryName", editName);
    formData.append("categoryImage", editImage);

    updateCategoryApi(editId, formData)
      .then((res) => {
        if (res.data.success === false) {
          toast.error(res.data.message);
        } else {
          toast.success(res.data.message);
          setCategories((prevCategories) =>
            prevCategories.map((category) =>
              category._id === editId
                ? {
                    ...category,
                    categoryName: editName,
                    categoryImageUrl: editPreviewImage,
                  }
                : category
            )
          );
          setActiveButton(editName);
        }
      })
      .catch((err) => {
        toast.error("Server error!");
        console.log(err.message);
      });
  };

  //===========Mark Category Unavailable Logic===========//
  const markUnavailable = (e) => {
    e.preventDefault();
    categoryUnavailableApi(editId, new FormData())
      .then((res) => {
        if (res.data.success === false) {
          toast.error(res.data.message);
        } else {
          setCategories((prevCategories) =>
            prevCategories.map((category) =>
              category._id === editId
                ? { ...category, status: !category.status }
                : category
            )
          );
          setCategoryActive(!categoryActive);
          toast.success(res.data.message);
        }
      })
      .catch((err) => {
        toast.error("Server error!");
        console.log(err.message);
      });
  };

  //===========Delete Category Logic===========//
  const handleDelete = (e) => {
    e.preventDefault();
    const confirmDialog = window.confirm(
      "Are you sure you want to delete this category and all its food items?"
    );
    if (!confirmDialog) return;
    else {
      deleteCategoryApi(editId)
        .then((res) => {
          if (res.data.success === false) {
            toast.error(res.data.message);
          } else {
            setCategories((prevCategories) =>
              prevCategories.filter((category) => category._id !== editId)
            );
            setActiveButton(categories[0].categoryName);
            toast.success(res.data.message);
          }
        })
        .catch((err) => {
          toast.error("Server error!");
          console.log(err.message);
        });
    }
  };

  //===================================================Logic for Food Items====================================================//

  //===========Add Food Logic===========//
  const [foodName, setFoodName] = useState("");
  const [foodPrice, setFoodPrice] = useState("");
  const [foodTime, setFoodTime] = useState("");
  const [foodImage, setFoodImage] = useState(null);
  const [foodPreviewImage, setFoodPreviewImage] = useState(null);

  const handleFoodImageUpload = (event) => {
    const file = event.target.files[0];
    setFoodImage(file);
    setFoodPreviewImage(URL.createObjectURL(file));
  };

  const handleFoodSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("foodName", foodName);
    formData.append("foodPrice", foodPrice);
    formData.append("foodTime", foodTime);
    formData.append("foodCategory", editId);
    formData.append("foodImage", foodImage);

    createFoodApi(formData)
      .then((res) => {
        if (res.data.success === false) {
          toast.error(res.data.message);
        } else {
          toast.success(res.data.message);
          setFoods(foods.concat(res.data.data));
          if (editId === res.data.data.foodCategory) {
            setActiveFoods((prevActiveFoods) => [
              ...prevActiveFoods,
              res.data.data,
            ]);
          }
        }
      })
      .catch((err) => {
        toast.error("Server Error");
        console.log(err.message);
      });
  };

  //===========Edit Food Logic===========//

  const [editFoodId, setFoodEditId] = useState("");
  const [editFoodName, setFoodEditName] = useState("");
  const [editFoodCategory, setFoodEditCategory] = useState("");
  const [editFoodPrice, setFoodEditPrice] = useState("");
  const [editFoodTime, setFoodEditTime] = useState("");
  const [editFoodImage, setFoodEditImage] = useState(null);
  const [editFoodPreviewImage, setFoodEditPreviewImage] = useState(null);

  const handleFoodEditImageUpload = (event) => {
    const file = event.target.files[0];
    setFoodEditImage(file);
    setFoodEditPreviewImage(URL.createObjectURL(file));
  };

  const handleFoodEdit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("foodName", editFoodName);
    formData.append("foodCategory", editFoodCategory);
    formData.append("foodPrice", editFoodPrice);
    formData.append("foodTime", editFoodTime);
    formData.append("foodImage", editFoodImage);

    updateFoodApi(editFoodId, formData)
      .then((res) => {
        if (res.data.success === false) {
          toast.error(res.data.message);
        } else {
          toast.success(res.data.message);
          setFoods((prevFoods) =>
            prevFoods.map((food) =>
              food._id === editFoodId
                ? {
                    ...food,
                    foodName: editFoodName,
                    foodImage: editFoodPreviewImage,
                    foodPrice: editFoodPrice,
                    foodTime: editFoodTime,
                  }
                : food
            )
          );
          setActiveFoods((prevFoods) =>
            prevFoods.map((food) =>
              food._id === editFoodId
                ? {
                    ...food,
                    foodName: editFoodName,
                    foodImage: editFoodPreviewImage,
                    foodPrice: editFoodPrice,
                    foodTime: editFoodTime,
                  }
                : food
            )
          );
        }
      })
      .catch((err) => {
        toast.error("Server error!");
        console.log(err.message);
      });
  };

  //===========Mark Food Unavailable Logic===========//
  const markFoodUnavailable = (e, id) => {
    e.preventDefault();
    foodUnavailableApi(id, new FormData())
      .then((res) => {
        if (res.data.success === false) {
          toast.error(res.data.message);
        } else {
          toast.success(res.data.message);
          setFoods((prevFoods) =>
            prevFoods.map((food) =>
              food._id === id ? { ...food, status: !food.status } : food
            )
          );
          setActiveFoods((prevFoods) =>
            prevFoods.map((food) =>
              food._id === id ? { ...food, status: !food.status } : food
            )
          );
        }
      })
      .catch((err) => {
        toast.error("Server error!");
        console.log(err.message);
      });
  };

  //===========Delete Food Logic===========//
  const handleFoodDelete = (e, id) => {
    e.preventDefault();
    const confirmDialog = window.confirm(
      "Are you sure you want to delete this food item?"
    );
    if (!confirmDialog) return;
    else {
      deleteFoodApi(id)
        .then((res) => {
          if (res.data.success === false) {
            toast.error(res.data.message);
          } else {
            setActiveFoods((prevActiveFoods) =>
              prevActiveFoods.filter((food) => food._id !== id)
            );
            toast.success(res.data.message);
          }
        })
        .catch((err) => {
          toast.error("Server error!");
          console.log(err.message);
        });
    }
  };

  //=======================================================================================================================//

  return (
    <>
      <div className="outer-container">
        <div className="categories">
          <div className="title-container">
            <span>Category</span>
            <div>
              <button data-bs-toggle="dropdown" style={{ marginRight: "12px" }}>
                <i className="fas fa-cog"></i>
              </button>
              <ul className="dropdown-menu">
                <li style={{ cursor: "pointer" }}>
                  <a
                    className="dropdown-item"
                    onClick={(e) => markUnavailable(e)}
                  >
                    {categoryActive ? "Mark Unavailable" : "Mark Available"}
                  </a>
                </li>

                <li style={{ cursor: "pointer" }}>
                  <a
                    className="dropdown-item"
                    data-bs-toggle="modal"
                    data-bs-target="#editCategory"
                  >
                    Edit This Category
                  </a>
                </li>

                <li className="delete-link" style={{ cursor: "pointer" }}>
                  <a
                    className="dropdown-item"
                    style={{ color: "red" }}
                    onClick={(e) => handleDelete(e)}
                  >
                    Delete This Category
                  </a>
                </li>
              </ul>

              <button data-bs-toggle="modal" data-bs-target="#addCategory">
                <i className="fas fa-plus" style={{ marginRight: "6px" }}></i>
                <span>Add</span>
              </button>
            </div>
          </div>
          <div className="category-item-container">
            {categories.map((category) => (
              <div
                className={
                  activeButton === category.categoryName
                    ? "category-item active"
                    : "category-item"
                }
                onClick={(e) => {
                  setEditId(category._id);
                  setEditName(category.categoryName);
                  setEditImage(category.categoryImageUrl);
                  setEditPreviewImage(category.categoryImageUrl);
                  setCategoryActive(category.status);
                  setActiveFoods(
                    foods.filter((food) => food.foodCategory === category._id)
                  );
                  handleButtonClick(e, category.categoryName);
                }}
              >
                <div
                  className="image"
                  style={{ backgroundColor: category.status ? "" : "gray" }}
                >
                  <img
                    src={category.categoryImageUrl}
                    alt="burger"
                    style={{
                      filter: category.status ? "none" : "grayscale(1)",
                    }}
                  />
                </div>
                <span
                  className="name"
                  style={{ color: category.status ? "" : "gray" }}
                >
                  {category.categoryName}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="food-items">
          {activeFoods.map((food) => (
            <div className="item-container">
              <div className="image">
                <img
                  src={food.foodImageUrl}
                  alt="burger"
                  style={{
                    filter:
                      categoryActive && food.status ? "none" : "grayscale(1)",
                  }}
                />
              </div>
              <div className="info-container">
                <div className="info">
                  <span className="name">{food.foodName}</span>
                  <div className="price">
                    <div style={{ marginTop: "4px" }}>
                      <span
                        className="currency"
                        style={{
                          color: categoryActive && food.status ? "" : "gray",
                        }}
                      >
                        Rs.
                      </span>
                    </div>
                    <span
                      className="amount"
                      style={{
                        color: categoryActive && food.status ? "" : "gray",
                      }}
                    >
                      {food.foodPrice}
                    </span>
                  </div>
                  <hr
                    className="horizontal-bar"
                    style={{ margin: "8px 0px" }}
                  />
                  <div className="bottom">
                    <div className="time-rating">
                      <div className="time">
                        <i
                          className="fas fa-stopwatch"
                          style={{
                            color:
                              categoryActive && food.status
                                ? "#ff5757"
                                : "gray",
                          }}
                        ></i>
                        <span
                          style={{
                            color:
                              categoryActive && food.status
                                ? "#ff5757"
                                : "gray",
                          }}
                        >
                          {food.foodTime} mins
                        </span>
                      </div>
                      <div className="rating">
                        <i
                          className="fas fa-star"
                          style={{
                            color:
                              categoryActive && food.status
                                ? "#ffbf00"
                                : "gray",
                          }}
                        ></i>
                        <span
                          style={{
                            color:
                              categoryActive && food.status
                                ? "#ffbf00"
                                : "gray",
                          }}
                        >
                          4.5
                        </span>
                      </div>
                    </div>
                    <div className="buttons">
                      <button
                        data-bs-toggle="modal"
                        data-bs-target="#editFood"
                        style={{
                          backgroundColor:
                            categoryActive && food.status ? null : "gray",
                          marginRight: "10px",
                        }}
                        onClick={() => {
                          setFoodEditId(food._id);
                          setFoodEditName(food.foodName);
                          setFoodEditCategory(food.foodCategory);
                          setFoodEditPrice(food.foodPrice);
                          setFoodEditTime(food.foodTime);
                          setFoodEditPreviewImage(food.foodImageUrl);
                        }}
                      >
                        <i
                          className="fas fa-edit"
                          style={{ width: "16px" }}
                        ></i>
                      </button>
                      <button
                        data-bs-toggle="dropdown"
                        style={{
                          backgroundColor:
                            categoryActive && food.status ? null : "gray",
                        }}
                      >
                        <i className="fas fa-cog"></i>
                      </button>
                      <ul className="dropdown-menu">
                        <li style={{ cursor: "pointer" }}>
                          {categoryActive && (
                            <a
                              className="dropdown-item"
                              onClick={(e) => markFoodUnavailable(e, food._id)}
                            >
                              {food.status
                                ? "Mark Unavailable"
                                : "Mark Available"}
                            </a>
                          )}
                        </li>

                        <li
                          className="delete-link"
                          style={{ cursor: "pointer" }}
                        >
                          <a
                            className="dropdown-item"
                            style={{ color: "red" }}
                            onClick={(e) => handleFoodDelete(e, food._id)}
                          >
                            Delete
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="item-container" style={{ marginTop: "60px" }}>
            <div className="info-container">
              <div
                className="add"
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                data-bs-toggle="modal"
                data-bs-target="#addFood"
              >
                <i
                  className="fas fa-plus-circle"
                  style={{ fontSize: "60px", marginBottom: "10px" }}
                ></i>
                <span>Add a New Item</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================== Add Category Modal =========================================*/}

      <div
        className="modal fade"
        id="addCategory"
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
                Add New Category
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <span style={{ marginLeft: "6px" }}>Name</span>
              <div className="input-group mb-3 mt-2">
                <input
                  onChange={(e) => setCategoryName(e.target.value)}
                  type="text"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Enter Category Name..."
                />
              </div>

              <span style={{ marginLeft: "6px" }}>Image</span>
              <div className="input-group mb-3 mt-2">
                <input
                  type="file"
                  className="form-control form-control-lg bg-light fs-6"
                  onChange={handleImageUpload}
                />
              </div>
              {previewImage && (
                <img
                  src={previewImage}
                  className="img-fluid rounded object-fit-cover"
                  alt="Product Image"
                  style={{
                    height: "100px",
                    marginBottom: "10px",
                    marginLeft: "100px",
                  }}
                />
              )}
              <p
                style={{
                  backgroundColor: "#a4e1f6",
                  color: "#37B5DF",
                  padding: "8px 12px",
                  fontSize: "12px",
                  borderRadius: "16px",
                }}
              >
                Note: Make sure the image matches the style to your previously
                added categories for best results.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: "center" }}>
              <button
                type="button"
                className="btn"
                onClick={handleSubmit}
                data-bs-dismiss="modal"
              >
                <i
                  className="fas fa-plus"
                  style={{ marginRight: "6px", fontSize: "14px" }}
                ></i>
                Add Category
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================== Edit Category Modal =========================================*/}

      <div
        className="modal fade"
        id="editCategory"
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
                Edit Category
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <span style={{ marginLeft: "6px" }}>Name</span>
              <div className="input-group mb-3 mt-2">
                <input
                  onChange={(e) => setEditName(e.target.value)}
                  value={editName}
                  type="text"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="New Category Name..."
                />
              </div>

              <span style={{ marginLeft: "6px" }}>Image</span>
              <div className="input-group mb-3 mt-2">
                <input
                  type="file"
                  className="form-control form-control-lg bg-light fs-6"
                  onChange={handleEditImageUpload}
                />
              </div>

              <img
                src={editPreviewImage}
                className="img-fluid rounded object-fit-cover"
                alt="Product Image"
                style={{
                  height: "100px",
                  marginBottom: "10px",
                  marginLeft: "100px",
                }}
              />

              <p
                style={{
                  backgroundColor: "#a4e1f6",
                  color: "#37B5DF",
                  padding: "8px 12px",
                  fontSize: "12px",
                  borderRadius: "16px",
                }}
              >
                Note: Make sure the image matches the style to your previously
                added categories for best results.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn"
                onClick={(e) => handleEdit(e)}
                data-bs-dismiss="modal"
              >
                <i
                  className="fas fa-edit"
                  style={{ marginRight: "6px", fontSize: "14px" }}
                ></i>
                Update
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================== Add Food Modal =========================================*/}

      <div
        className="modal fade"
        id="addFood"
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
                Add New Food Item
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <span style={{ marginLeft: "6px" }}>Name</span>
              <div className="input-group mb-3 mt-2">
                <input
                  onChange={(e) => setFoodName(e.target.value)}
                  type="text"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Food Name..."
                />
              </div>

              <div style={{ display: "flex" }}>
                <div style={{ marginRight: "10px" }}>
                  <span style={{ marginLeft: "6px" }}>Price (Rs.)</span>
                  <div className="input-group mb-3 mt-2">
                    <input
                      onChange={(e) => setFoodPrice(e.target.value)}
                      type="text"
                      className="form-control form-control-lg bg-light fs-6"
                      placeholder="Price..."
                    />
                  </div>
                </div>

                <div style={{ marginLeft: "10px" }}>
                  <span style={{ marginLeft: "6px" }}>Time (Minutes)</span>
                  <div className="input-group mb-3 mt-2">
                    <input
                      onChange={(e) => setFoodTime(e.target.value)}
                      type="text"
                      className="form-control form-control-lg bg-light fs-6"
                      placeholder="Time to Prepare..."
                    />
                  </div>
                </div>
              </div>

              <span style={{ marginLeft: "6px" }}>Image</span>
              <div className="input-group mb-3 mt-2">
                <input
                  type="file"
                  className="form-control form-control-lg bg-light fs-6"
                  onChange={handleFoodImageUpload}
                />
              </div>

              {foodPreviewImage && (
                <img
                  src={foodPreviewImage}
                  className="img-fluid rounded object-fit-cover"
                  alt="Food Image"
                  style={{
                    height: "100px",
                    marginBottom: "10px",
                    marginLeft: "100px",
                  }}
                />
              )}

              <p
                style={{
                  backgroundColor: "#a4e1f6",
                  color: "#37B5DF",
                  padding: "8px 12px",
                  fontSize: "12px",
                  borderRadius: "16px",
                }}
              >
                Note: Make sure the image matches the style to your previously
                added food items for best results.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: "center" }}>
              <button
                type="button"
                className="btn"
                onClick={handleFoodSubmit}
                data-bs-dismiss="modal"
              >
                <i
                  className="fas fa-plus"
                  style={{ marginRight: "6px", fontSize: "14px" }}
                ></i>
                Add Food Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================== Edit Food Modal =========================================*/}

      <div
        className="modal fade"
        id="editFood"
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
                Edit Food Item
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <span style={{ marginLeft: "6px" }}>Name</span>
              <div className="input-group mb-3 mt-2">
                <input
                  onChange={(e) => setFoodEditName(e.target.value)}
                  value={editFoodName}
                  type="text"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Food Name..."
                />
              </div>

              <span style={{ marginLeft: "6px" }}>Category</span>
              <div className="input-group mb-3 mt-2">
                <select
                  onChange={(e) => setFoodEditCategory(e.target.value)}
                  value={editFoodCategory}
                  type="text"
                  className="form-control form-control-lg bg-light fs-6"
                  placeholder="Category..."
                >
                  {categories.map((category) => (
                    <option value={category._id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex" }}>
                <div style={{ marginRight: "10px" }}>
                  <span style={{ marginLeft: "6px" }}>Price (Rs.)</span>
                  <div className="input-group mb-3 mt-2">
                    <input
                      onChange={(e) => setFoodEditPrice(e.target.value)}
                      value={editFoodPrice}
                      type="text"
                      className="form-control form-control-lg bg-light fs-6"
                      placeholder="Price..."
                    />
                  </div>
                </div>

                <div style={{ marginLeft: "10px" }}>
                  <span style={{ marginLeft: "6px" }}>Time (Minutes)</span>
                  <div className="input-group mb-3 mt-2">
                    <input
                      onChange={(e) => setFoodEditTime(e.target.value)}
                      value={editFoodTime}
                      type="text"
                      className="form-control form-control-lg bg-light fs-6"
                      placeholder="Time to Prepare..."
                    />
                  </div>
                </div>
              </div>

              <span style={{ marginLeft: "6px" }}>Image</span>
              <div className="input-group mb-3 mt-2">
                <input
                  type="file"
                  className="form-control form-control-lg bg-light fs-6"
                  onChange={handleFoodEditImageUpload}
                />
              </div>

              {editFoodPreviewImage && (
                <img
                  src={editFoodPreviewImage}
                  className="img-fluid rounded object-fit-cover"
                  alt="Food Image"
                  style={{
                    height: "100px",
                    marginBottom: "10px",
                    marginLeft: "100px",
                  }}
                />
              )}

              <p
                style={{
                  backgroundColor: "#a4e1f6",
                  color: "#37B5DF",
                  padding: "8px 12px",
                  fontSize: "12px",
                  borderRadius: "16px",
                }}
              >
                Note: Make sure the image matches the style to your previously
                added food items for best results.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn"
                onClick={(e) => handleFoodEdit(e)}
                data-bs-dismiss="modal"
              >
                <i
                  className="fas fa-edit"
                  style={{ marginRight: "6px", fontSize: "14px" }}
                ></i>
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Menu;
