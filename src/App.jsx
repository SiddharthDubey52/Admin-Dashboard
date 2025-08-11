import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import RouteWrapper from "./Routes/RouteWrapper";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <Router>
      <div>
        <RouteWrapper />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App;