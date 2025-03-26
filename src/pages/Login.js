import React, { useState } from "react";
import { useEffect } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../constants';

const Login = () => {
    const navigate = useNavigate();

    const username = localStorage.getItem("username");
    useEffect(() => {
        if (username) {
          navigate('/dashboard');
        }
      }, [username, navigate]);

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");  // Clear previous error

        try {
            const response = await axios.post(API_URL + "/utilisateurs/login", {
                login,
                password,
            });

            console.log("Login Successful", response.data);

            // Store user info in local storage (optional)
            localStorage.setItem("username", response.data.login);
            localStorage.setItem("role", response.data.role.nom);

            // Redirect to dashboard
            navigate("/dashboard");
        } catch (error) {
            setError("Invalid login or password");
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow-sm" style={{ width: "350px" }}>
                <h3 className="text-center mb-3">Login</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Login</label>
                        <input
                            type="text"
                            className="form-control"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            required
                            onFocus={() => setError("")}  // Clear error when user starts typing
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
                            onFocus={() => setError("")}  // Clear error when user starts typing
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
