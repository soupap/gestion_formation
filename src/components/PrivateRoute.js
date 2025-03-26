import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
    const username = localStorage.getItem("username");
    return username ? <Outlet /> : <Navigate to="/" replace />;
};


export default PrivateRoute;
