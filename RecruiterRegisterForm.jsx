import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { recruiterSupabase } from "./src/lib/supabaseClient";

const RecruiterRegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    phoneNumber: ""
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSupabaseRegister = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await recruiterSupabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            company: formData.company,
            role: 'recruiter'
          }
        }
      });

      // Additional recruiter profile insert
      const { data: signUpData, error: signUpError } = await recruiterSupabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            company: formData.company,
            role: 'recruiter'
          }
        }
      });

      if (signUpData?.user) {
        await recruiterSupabase
          .from('recruiters')
          .insert([
            {
              user_id: signUpData.user.id,
              company: formData.company,
              full_name: formData.name,
              role: 'recruiter',
              email: formData.email,
              phone_number: formData.phoneNumber // ← added this line
            }
          ]);
      }

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        console.log('Registration successful with Supabase:', data.user.id);
        navigate('/helloR');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.company || !formData.email || !formData.password || !formData.phoneNumber) {
      setError('All fields are required');
      return;
    }
    
    // Use Supabase registration
    await handleSupabaseRegister();
  };

  return (
    <div className="p-4">
      <p className="mb-4">
        Create your recruiter account:
      </p>      <div className="mt-6">
        <h3 className="font-medium mb-3">Register with email and password:</h3>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              className="w-full border rounded px-3 py-2" 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Company</label>
            <input 
              type="text" 
              name="company" 
              value={formData.company} 
              onChange={handleChange}
              className="w-full border rounded px-3 py-2" 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              className="w-full border rounded px-3 py-2" 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange}
              className="w-full border rounded px-3 py-2" 
              required 
              minLength="8"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
              pattern="[0-9]{10,15}"
              placeholder="Enter phone number"
            />
          </div>
          <button 
            type="submit" 
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecruiterRegisterForm;