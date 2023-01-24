import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
//
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Sign from "./pages/Sign";
import Main from "./pages/game/Main";
//redux
import { Provider } from "react-redux";
import store from "./store";
import { loadUser } from "./actions/user";
import setAuthToken from "./utils/setAuthToken";
import { LOGOUT } from "./actions/types";

function App() {
  useEffect(() => {
    console.log(process.env);
    // check for token in LS when app first runs
    console.log(localStorage.token);
    if (localStorage.token) {
      // if there is a token set axios headers for all requests
      setAuthToken(localStorage.token);
      // connectWallet();
    }
    // try to fetch a user, if no token or invalid token we
    // will get a 401 response from our API
    // store.dispatch(loadUser());

    // log user out from all tabs if they log out in one tab
    window.addEventListener("storage", () => {
      if (!localStorage.token) store.dispatch({ type: LOGOUT });
    });
  }, []);
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* <Route index element={<Home />} /> */}
            <Route path="game" element={<Home />} />

            <Route path="dashboard" element={<Dashboard />} />
            <Route path="signup" element={<Sign />} />
          </Route>
          <Route path="/battle/:tank" element={<Main />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
