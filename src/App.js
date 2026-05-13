import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isSecure, setIsSecure] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(false); // AI State

  const toggleSecurity = async () => {
    const newMode = !isSecure;
    const res = await axios.post(`${API_BASE_URL}/api/toggle-security`, { isSecure: newMode });
    setIsSecure(res.data.isSecure);
    if (!newMode) setIsAiEnabled(false); // Disable AI if security is turned off
  };

  const toggleAi = async () => {
    const res = await axios.post(`${API_BASE_URL}/api/toggle-ai`, { isAiEnabled: !isAiEnabled });
    setIsAiEnabled(res.data.isAiEnabled);
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/login`, { email, password });
      alert(res.data.message);
    } catch (err) { alert("Login Failed"); }
  };

  const postReview = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/reviews`, { content: review });
      alert(res.data.message);
      setReview("");
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || "Post Failed");
    }
  };

  const fetchReviews = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/reviews`);
    setReviews(res.data);
  };

  const fetchProfile = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/profile/${id}`);
      setProfile(res.data);
    } catch (err) { alert("SECURITY ALERT: " + err.response.data.message); }
  };

  const placeOrder = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/place-order`);
      alert("Order Successful");
    } catch (err) { alert("CSRF BLOCK: " + err.response.data.message); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const cardStyle = { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: "20px" };
  const inputStyle = { width: "100%", padding: "10px", margin: "8px 0", borderRadius: "8px", border: "1px solid #ccc" };
  const buttonStyle = { padding: "10px 15px", borderRadius: "8px", border: "none", background: "#4f46e5", color: "#fff", cursor: "pointer", marginTop: "10px" };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", padding: "30px", fontFamily: "Arial" }}>
      
      {/* SECURITY STATUS CARD */}
      <div style={{ ...cardStyle, textAlign: 'center', background: isSecure ? '#dcfce7' : '#fee2e2' }}>
        <h2 style={{ color: isSecure ? '#166534' : '#991b1b' }}>
          Status: {isSecure ? "🛡️ SECURE MODE" : "⚠️ INSECURE MODE"}
        </h2>
        <button style={{ ...buttonStyle, background: isSecure ? '#22c55e' : '#ef4444' }} onClick={toggleSecurity}>
          Switch to {isSecure ? "Insecure" : "Secure"} Mode
        </button>

        {/* AI TOGGLE (Only visible in Secure Mode) */}
        {isSecure && (
          <div style={{ marginTop: "15px", borderTop: "1px solid #bbf7d0", paddingTop: "10px" }}>
            <p>AI Moderation: <strong>{isAiEnabled ? "ON" : "OFF"}</strong></p>
            <button 
              style={{ ...buttonStyle, background: isAiEnabled ? '#15803d' : '#6b7280' }} 
              onClick={toggleAi}
            >
              {isAiEnabled ? "Disable AI Moderation" : "Enable AI Moderation"}
            </button>
          </div>
        )}
      </div>

      <h1 style={{ textAlign: "center" }}>Security Lab + AI</h1>

      {/* LOGIN */}
      <div style={cardStyle}>
        <h3>Login</h3>
        <input style={inputStyle} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input style={inputStyle} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button style={buttonStyle} onClick={handleLogin}>Login</button>
      </div>

      {/* REVIEWS */}
      <div style={cardStyle}>
        <h3>Product Reviews</h3>
        <textarea 
          style={{ ...inputStyle, height: "80px" }} 
          value={review}
          placeholder="Write something... (Try being mean or using <script>)" 
          onChange={(e) => setReview(e.target.value)} 
        />
        <button style={buttonStyle} onClick={postReview}>Submit Review</button>
        
        <div style={{ marginTop: "15px" }}>
          {reviews.map((r, i) => (
            <div key={i} style={{ background: "#fafafa", border: "1px solid #ddd", borderRadius: "8px", margin: "10px 0", padding: "10px" }}>
              {isSecure ? <p>{r.content}</p> : <div dangerouslySetInnerHTML={{ __html: r.content }} />}
            </div>
          ))}
        </div>
      </div>

      {/* IDOR & CSRF (Same as before) */}
      <div style={cardStyle}>
        <h3>IDOR Lab</h3>
        <button style={buttonStyle} onClick={() => fetchProfile(1)}>View Profile 1</button>
      </div>

      <div style={cardStyle}>
        <h3>CSRF Lab</h3>
        <button style={{ ...buttonStyle, background: "#dc2626" }} onClick={placeOrder}>Place $2000 Order</button>
      </div>
    </div>
  );
}

export default App;
