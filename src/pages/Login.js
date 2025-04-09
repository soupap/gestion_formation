import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../constants';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Check for existing valid token on component mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (token) {
            if(role === "UTILISATEUR") {
                navigate("/formations"); // Redirect to formations page for formateur
            }else{
                navigate("/dashboard"); // Redirect to dashboard for admin
            }
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");  // Reset error message on submit

        try {
            const response = await axios.post(API_URL + "/api/v1/auth/login", {
                username,
                password
            });

            console.log("Login Successful", response.data);

            // Store token and redirect
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);
            if(response.data.role === "UTILISATEUR") {
                navigate("/formations"); // Redirect to formations page for formateur
            }else{
                navigate("/dashboard"); // Redirect to dashboard for admin
            }
        } catch (error) {
            console.error("Login error", error);
            setError(error.response?.data?.message || "Login failed. Please check your credentials.");
        }
    };

    const handleRegisterRedirect = () => {
        navigate("/register");  // Redirect to the Register page
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow-sm" style={{ width: "350px" }}>
                <h3 className="text-center mb-3">Login</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                            onFocus={() => setError("")}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            onFocus={() => setError("")}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mb-2">
                        Login
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-link w-100 text-decoration-none" 
                        onClick={handleRegisterRedirect}
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
