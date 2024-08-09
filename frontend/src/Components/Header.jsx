import React from "react";
import { useNavigate } from "react-router-dom";
import { ButtonGroup } from "react-bootstrap";
import HeaderButton from "./HeaderButton";


const Header = ({ isAuth, userType, handleLogout }) => {
    const nav = useNavigate();
  
    const goToRegistration = () => {
      nav('register');
    };
  
    return (
      <div
      className="primaryDiv"
      style={{
        height: '60px',
        width: '100%',
        textAlign: 'center',
        backgroundColor: '#3A667A',
        display: 'flex',
        justifyContent: 'center', // Horizontalno centriranje
        alignItems: 'center', // Vertikalno centriranje
      }}
      >
        <ButtonGroup spacing="0.5rem" aria-label="spacing button group" sx={{ marginTop: 1, marginBottom: 1}}>
          {!isAuth && (
            <HeaderButton
              sx={{ m: 1 }}
              variant="contained"
              onClick={() => nav('login')}
            >
              Log In
            </HeaderButton>
          )}
          {!isAuth && (
            <HeaderButton
              variant="contained"
              sx={{ m: 1 }}
              onClick={goToRegistration}
            >
              Registration
            </HeaderButton>
          )}
          {isAuth && userType === 'user' && (
            <HeaderButton
              sx={{ marginTop: 0.3, marginBottom: 1, marginLeft: 2}}
              variant="contained"
              onClick={() => nav('userDashboard')}
            >
              User Dashboard
            </HeaderButton>
          )}
  
          {isAuth && userType === 'admin' && (
            <HeaderButton
              sx={{ marginTop: 0.3, marginBottom: 1, marginLeft: 2}}
              variant="contained"
              onClick={() => nav('adminDashboard')}
            >
              Admin Dashboard
            </HeaderButton>
          )}

          {isAuth && userType === 'user' && (
            <HeaderButton
              sx={{ marginTop: 0.3, marginBottom: 1, marginLeft: 2}}
              variant="contained"
              onClick={() => nav('locationPicker')}
            >
              Pick the location for new system
            </HeaderButton>
          )}
  
         {isAuth && (
            <HeaderButton
              sx={{ marginTop: 0.3, marginBottom: 1, marginLeft: 2}}
              variant="contained"
              onClick={handleLogout}
              href="/home"
            >
              Logout
            </HeaderButton>
          )} 
        </ButtonGroup>
      </div>
    );
  };
  
  export default Header;