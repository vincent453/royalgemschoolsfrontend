import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? "https://royalgemschoolsbackend.vercel.app"}/api/accounting`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getSummary = () => API.get("/summary").then((res) => res.data);
export const getIncomes = (params = {}) => API.get("/incomes", { params }).then((res) => res.data);
export const createIncome = (payload) => API.post("/incomes", payload).then((res) => res.data);
export const updateIncome = (id, payload) => API.put(`/incomes/${id}`, payload).then((res) => res.data);
export const deleteIncome = (id) => API.delete(`/incomes/${id}`).then((res) => res.data);
export const getExpenses = (params = {}) => API.get("/expenses", { params }).then((res) => res.data);
export const createExpense = (payload) => API.post("/expenses", payload).then((res) => res.data);
export const updateExpense = (id, payload) => API.put(`/expenses/${id}`, payload).then((res) => res.data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`).then((res) => res.data);
export const getLedger = (params = {}) => API.get("/ledger", { params }).then((res) => res.data);
