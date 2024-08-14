import axios from "axios";

const Api = axios.create({
  baseURL: "https://localhost:5000",
  withCredentials: true, // Ensure cookies are sent with requests
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export const sessionApi = () => Api.get('/api/user/session');
export const getCsrfTokenApi = () => Api.get('/api/csrf-token');

// Helper function to get CSRF token and include it in the headers
const withCsrfToken = async (apiFunc, ...args) => {
  const { data } = await getCsrfTokenApi();
  const csrfToken = data.csrfToken;
  return apiFunc(...args, csrfToken);
};

// User API functions
export const loginApi = (data) => withCsrfToken((data, csrfToken) => 
    Api.post('/api/user/login', data, { headers: { 'X-CSRF-Token': csrfToken } }), data
  );
  
  export const createUserApi = (data) => withCsrfToken((data, csrfToken) => 
    Api.post('/api/user/signup', data, { headers: { 'X-CSRF-Token': csrfToken } }), data
  );
  
  export const sendOTPApi = (data) => withCsrfToken((data, csrfToken) => 
    Api.post('/api/user/send-otp', data, { headers: { 'X-CSRF-Token': csrfToken } }), data
  );
  
  export const verifyOTPApi = (data) => withCsrfToken((data, csrfToken) => 
    Api.post('/api/user/verify-otp', data, { headers: { 'X-CSRF-Token': csrfToken } }), data
  );
  
  export const recoverPasswordApi = (data) => withCsrfToken((data, csrfToken) => 
    Api.put(`/api/user/reset-password`, data, { headers: { 'X-CSRF-Token': csrfToken } }), data
  );
  
  export const changePasswordApi = (data) => withCsrfToken((data, csrfToken) => 
    Api.put(`/api/user/change-password`, data, { headers: { 'X-CSRF-Token': csrfToken } }), data
  );
  
  export const logoutApi = () => withCsrfToken((csrfToken) => 
    Api.post('/api/user/logout', {}, { headers: { 'X-CSRF-Token': csrfToken } })
  );

// Category API functions
export const getAllCategoriesApi = () => Api.get('/api/category/get-categories');
export const createCategoryApi = (data) => withCsrfToken((data, csrfToken) => 
    Api.post('api/category/create-category', data, { headers: { 'X-CSRF-Token': csrfToken } }), data
  );
  
  export const categoryUnavailableApi = (id, data) => withCsrfToken((id, data, csrfToken) => 
    Api.put(`/api/category/unavailable/${id}`, data, { headers: { 'X-CSRF-Token': csrfToken } }), id, data
  );
  
  export const updateCategoryApi = (id, data) => withCsrfToken((id, data, csrfToken) => 
    Api.put(`/api/category/update-category/${id}`, data, { headers: { 'X-CSRF-Token': csrfToken } }), id, data
  );
  
  export const deleteCategoryApi = (id) => withCsrfToken((id, csrfToken) => 
    Api.delete(`/api/category/delete-category/${id}`, { headers: { 'X-CSRF-Token': csrfToken } }), id
  );

// Food API functions
export const getAllFoodsApi = () => Api.get('/api/food/get-foods');
export const createFoodApi = (data) => withCsrfToken((data, csrfToken) => 
    Api.post('api/food/create-food', data, { headers: { 'X-CSRF-Token': csrfToken } }), data
  );
  
  export const foodUnavailableApi = (id, data) => withCsrfToken((id, data, csrfToken) => 
    Api.put(`/api/food/unavailable/${id}`, data, { headers: { 'X-CSRF-Token': csrfToken } }), id, data
  );
  
  export const updateFoodApi = (id, data) => withCsrfToken((id, data, csrfToken) => 
    Api.put(`/api/food/update-food/${id}`, data, { headers: { 'X-CSRF-Token': csrfToken } }), id, data
  );
  
  export const deleteFoodApi = (id) => withCsrfToken((id, csrfToken) => 
    Api.delete(`/api/food/delete-food/${id}`, { headers: { 'X-CSRF-Token': csrfToken } }), id
  );

// Table API functions
export const getRequestedTableApi = () => Api.get('api/tables/get-tables/requested');
export const getTablesApi = () => Api.get('api/tables/get-tables/unavailable');

// Order API functions
export const getTableOrdersApi = (tableId) => Api.get(`api/order/get-table-orders/${tableId}`);

export const updateOrderStatusApi = (id, data) => withCsrfToken((id, data, csrfToken) => 
  Api.put(`api/order/update-status/${id}`, data, { headers: { 'X-CSRF-Token': csrfToken } }), id, data
);

export const updatePaymentStatusApi = (id, data) => withCsrfToken((id, data, csrfToken) => 
  Api.put(`api/order/update-payment/${id}`, data, { headers: { 'X-CSRF-Token': csrfToken } }), id, data
);

export const checkoutApi = (id, data) => withCsrfToken((id, data, csrfToken) => 
  Api.put(`api/order/checkout/${id}`, data, { headers: { 'X-CSRF-Token': csrfToken } }), id, data
);

export const getCheckedOutStatsApi = () => Api.get('api/order/get-summary');
export const getHistoryApi = (date) => Api.get(`api/order/get-history/${date}`);