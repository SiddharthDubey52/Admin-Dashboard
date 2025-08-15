import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import RouteWrapper from "./Routes/RouteWrapper";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <Router>
      <div>
        <RouteWrapper />
        <ToastContainer/>
      </div>
    </Router>
  );
};

export default App;