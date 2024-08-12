import axios from "axios";

const Api = axios.create({
    baseURL: "https://localhost:5000",
    withCredentials: true,
    headers: {
        "Content-Type": "multipart/form-data",
    },
});

const token = localStorage.getItem("token");
const config = {
    headers: {
        'authorization': `Bearer ${token}`
    }
}

//user api
export const loginApi = (data) => Api.post('/api/user/login', data)
export const createUserApi = (data) => Api.post('/api/user/signup', data)
export const sendOTPApi = (data) => Api.post('/api/user/send-otp', data)
export const verifyOTPApi = (data) => Api.post('/api/user/verify-otp', data)
export const recoverPasswordApi = (number, data) => Api.put(`/api/user/reset-password/${number}`, data)

//category api
export const createCategoryApi = (data) => Api.post('api/category/create-category', data, config)
export const getAllCategoriesApi = () => Api.get('/api/category/get-categories')
export const categoryUnavailableApi = (id, data) => Api.put(`/api/category/unavailable/${id}`, data, config)
export const updateCategoryApi = (id, data) => Api.put(`/api/category/update-category/${id}`, data, config)
export const deleteCategoryApi = (id) => Api.delete(`/api/category/delete-category/${id}`, config)

//food api
export const createFoodApi = (data) => Api.post('api/food/create-food', data, config)
export const getAllFoodsApi = () => Api.get('/api/food/get-foods')
export const foodUnavailableApi = (id, data) => Api.put(`/api/food/unavailable/${id}`, data, config)
export const updateFoodApi = (id, data) => Api.put(`/api/food/update-food/${id}`, data, config)
export const deleteFoodApi = (id) => Api.delete(`/api/food/delete-food/${id}`, config)

//table api
export const getRequestedTableApi = () => Api.get('api/tables/get-tables/requested', config)
export const getTablesApi = () => Api.get('api/tables/get-tables/unavailable', config)

//order api
export const getTableOrdersApi = (tableId) => Api.get(`api/order/get-table-orders/${tableId}`, config)
export const updateOrderStatusApi = (id, data) => Api.put(`api/order/update-status/${id}`, data, config)
export const updatePaymentStatusApi = (id, data) => Api.put(`api/order/update-payment/${id}`, data, config)
export const checkoutApi = (id, data) => Api.put(`api/order/checkout/${id}`, data, config)
export const getCheckedOutStatsApi = () => Api.get('api/order/get-summary', config)
export const getHistoryApi = (date) => Api.get(`api/order/get-history/${date}`, config)