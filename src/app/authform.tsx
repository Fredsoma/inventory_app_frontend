"use client";

import React, { useState } from "react";

const AuthForm = () => {
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState<string | null>(null);

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      setMessage("Registration failed");
      console.error("Registration error:", error);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const result = await response.json();
      setMessage(result.message);
      if (result.token) {
        localStorage.setItem("token", result.token);
      }
    } catch (error) {
      setMessage("Login failed");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleRegisterSubmit} className="auth-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={registerForm.name}
          onChange={handleRegisterChange}
          required
          className="input-field"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={registerForm.email}
          onChange={handleRegisterChange}
          required
          className="input-field"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={registerForm.password}
          onChange={handleRegisterChange}
          required
          className="input-field"
        />
        <button type="submit" className="btn-submit">Register</button>
      </form>

      <h2>Login</h2>
      <form onSubmit={handleLoginSubmit} className="auth-form">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={loginForm.email}
          onChange={handleLoginChange}
          required
          className="input-field"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={loginForm.password}
          onChange={handleLoginChange}
          required
          className="input-field"
        />
        <button type="submit" className="btn-submit">Login</button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AuthForm;
