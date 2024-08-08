import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import auth  from '../config/firebase-config.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { logIn } from '../Services/UserService';

const LogIn = ({ handleUserInfo }) => {

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const redirectTo = (userType) => {
    if(userType === 'admin'){
        navigate('/adminDashboard');
    }
    else if(userType === 'user'){
        navigate('/userDashboard');
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      const token = await user.getIdToken();
  
      const data = await logIn(formData.email, formData.password, token);
      if(data !== null){
        if (data.message === 'Your account is currently blocked. Please contact customer service for more information.') {
          window.alert(data.message);
          sessionStorage.setItem("isAuth", false);
          handleUserInfo(false);
          return;
        }
        console.log(data);
    
        sessionStorage.setItem('isAuth', JSON.stringify(true));
        sessionStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('token', token);
        handleUserInfo(true);
        alert("Successfull login!");
        redirectTo(data.type);
      } 
      else
      {
        sessionStorage.setItem("isAuth", false);
        handleUserInfo(false); 
      }
      
    } catch (error) {
      console.error('Error:', error);
      window.alert(error);
    }
  };

  return (
    <div className="centralDiv">
      <div className="centralComponentDiv">
        <h2>Login</h2>
        <div>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" >Email:</label>
              <input
                type="email"
                id="email"
                name="email"
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
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className='secondaryBtn'>Log In</button>
          </form>
          <div>
            <p>Don't have an account? <a href="/register">Register</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
