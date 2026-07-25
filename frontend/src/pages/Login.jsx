import { useState } from "react";
import { FaShieldAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    try {
      login(username, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo"><FaShieldAlt /></div>
        <h1>HumanShield AI</h1>
        <p>Sign in to the safety operations platform</p>
        {error && <div className="form-error">{error}</div>}
        <label>Username<input value={username} onChange={(e) => setUsername(e.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn btn-primary" type="submit">Sign in</button>
        <small>Demo: admin/admin123, supervisor/super123, viewer/viewer123</small>
      </form>
    </div>
  );
}
