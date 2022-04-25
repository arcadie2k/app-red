import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";
import "flowbite";
require("dotenv").config();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
