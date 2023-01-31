import axios from "axios";
import store from "../store";
import { LOGOUT } from "../actions/types";

// Create an instance of axios
const api = axios.create({
  // baseURL: "http://10.10.10.79:3000/api",
  // baseURL: "https://backend.robotfactory.works/api",
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});
/*
  NOTE: intercept any error responses from the api
 and check if the token is no longer valid.
 ie. Token has expired or user is no longer
 authenticated.
 logout the user if the token has expired
*/

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response.status === 401) {
      store.dispatch({ type: LOGOUT });
    }
    return Promise.reject(err);
  }
);

export default api;
