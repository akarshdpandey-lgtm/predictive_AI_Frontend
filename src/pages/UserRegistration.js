import React, { useState } from 'react';
import axios from 'axios';

function UserRegistration({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'male',
    location: 'Delhi'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/user/register',
        formData
      );

      onSuccess(response.data.user_id);
      alert('Registration successful! 🎉');
    } catch (err) {
      setError(err.response?.data?.error || 'Error registering user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-form">
      <h2>📝 User Registration</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="अपना नाम दर्ज करो"
          />
        </div>

        <div className="form-group">
          <label>Phone:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="10-digit phone number"
          />
        </div>

        <div className="form-group">
          <label>Age (months):</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            placeholder="महीनों में उम्र"
          />
        </div>

        <div className="form-group">
          <label>Gender:</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="male">लड़का</option>
            <option value="female">लड़की</option>
          </select>
        </div>

        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="शहर/गाँव का नाम"
          />
        </div>

        {error && <p className="error">❌ {error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : '✅ Register करो'}
        </button>
      </form>
    </div>
  );
}

export default UserRegistration;