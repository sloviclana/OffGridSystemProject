import React from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import auth from '../config/firebase-config.js';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { register } from "../Services/UserService";

const Register = ({handleUserInfo}) => {

  const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '', 
        userType: 'user'
      });

  const[error, setError] = useState(false);

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(formData.firstName.length === 0 || formData.lastName.length === 0 || formData.email.length === 0 || formData.password.length === 0){
      setError(true);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      const token = await user.getIdToken();
 
      const data = await register(formData, token);
      if(data !== null){
        console.log(data);
  
        sessionStorage.setItem('isAuth', JSON.stringify(true));
        sessionStorage.setItem('user', JSON.stringify(data));
        sessionStorage.setItem('token', token);
        handleUserInfo(true);
        alert("Successfull registration!");
        navigate('/login');
      }
      else
      {
        sessionStorage.setItem("isAuth", false);
        handleUserInfo(false); 
      }
    } catch (error) {
      console.error('Error:', error);
      window.alert('Registration failed! Please try again.');
    }
  };
  
    

  return (
        <div className="homePageDiv">
            <div className="centralComponentDiv">
            <h2>Register</h2>
        <div>
          <form onSubmit={handleSubmit}>
          <div>
              <label htmlFor="firstName" >First name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName} 
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" >Last name:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName} 
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="email" >Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email} 
                onChange={handleChange}
                required
              />
            </div>
            <div >
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password} 
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="userType" className="form-label">User Type:</label>
              <select 
                className="form-control" 
                id="userType" 
                name="userType" 
                value={formData.userType} 
                onChange={handleChange} 
                required 
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button type="submit" className='secondaryBtn'>Register</button>
          </form>
          <div>
          <p>Already have an account? <a href="/login">Login</a></p>
          </div>
        </div>
            </div>
        </div>
    );
};

export default Register;