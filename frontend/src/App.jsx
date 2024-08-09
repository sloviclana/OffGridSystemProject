import React, {useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './Components/HomePage';
import Header from './Components/Header';
import LogIn from './Components/LogIn';
import Register from './Components/Register';
import Weather from './Components/Weather';
import { useNavigate } from 'react-router-dom';



function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [userType, setUserType] = useState('');
  const [isUserInfoGot, setIsUserInfoGot] = useState(false);  //da li smo dobili podatke o korisniku

  useEffect(() => {
    const getAuth = () => {
        if(sessionStorage.getItem('user') !== null && sessionStorage.getItem('isAuth') !== null){
            setIsAuth(JSON.parse(sessionStorage.getItem('isAuth')))
            const user = JSON.parse(sessionStorage.getItem('user'))
            setUserType(user.userType);
        }
    }
    getAuth();
  }, [isUserInfoGot]); //kada dobijemo ove podatke, ova funkcija ce se rerenderovati i onda ce se azurirati stanja
                            //na taj nacin izqazvacemo ponovno azuriranje stranice i onda navbara
  
  const handleUserInfo = (gotUserInfo) => {
    setIsUserInfoGot(gotUserInfo);
  }

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isAuth');
    sessionStorage.removeItem('token');
    setIsAuth(false);
    setUserType('');
    setIsUserInfoGot(false); 
  }

  return (
    <div className='primaryDiv'>
        <BrowserRouter>
        <Header isAuth={isAuth} userType = {userType} handleLogout={handleLogout}/>
            <Routes>
                <Route path='/' element={<HomePage></HomePage>}></Route>
                <Route path='/login' element={<LogIn handleUserInfo={handleUserInfo}/>}></Route>
                <Route path='/register' element={<Register handleUserInfo={handleUserInfo}/>}></Route>
                <Route path='/locationPicker' element={<Weather></Weather>}></Route>
            </Routes>
        </BrowserRouter>
    </div>   
  );
}

export default App;
