import React, {useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import HomePage from './Components/HomePage';
import Header from './Components/Header';
import LogIn from './Components/LogIn';
import Register from './Components/Register';
import Weather from './Components/Weather';
import UserDashboard from './Components/UserDashboard';
import AdminDashboard from './Components/AdminDashboard';
import SetConstantParameters from './Components/SetConstantParameters';
import MyChart from './Components/MyChart';
import PanelSystemOverview from './Components/PanelSystemOverview';



function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [userType, setUserType] = useState('');
  const [isUserInfoGot, setIsUserInfoGot] = useState(false);  //da li smo dobili podatke o korisniku


  //const navigate = useNavigate();
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
    //navigate('/');
  }

  return (
    <div className='primaryDiv'>
        <BrowserRouter>
        <Header isAuth={isAuth} userType = {userType} handleLogout={handleLogout}/>
        <TransitionGroup>
          <CSSTransition timeout={300} className="slide">
            <Routes>
                  <Route path='/' element={<HomePage></HomePage>}></Route>
                  <Route path='/login' element={<LogIn handleUserInfo={handleUserInfo}/>}></Route>
                  <Route path='/register' element={<Register handleUserInfo={handleUserInfo}/>}></Route>
                  <Route path='/locationPicker' element={<Weather></Weather>}></Route>
                  <Route path='/adminDashboard' element={<AdminDashboard></AdminDashboard>}></Route>
                  <Route path='/userDashboard' element={<UserDashboard></UserDashboard>}></Route>
                  <Route path='/setConstParameters' element={<SetConstantParameters></SetConstantParameters>}></Route>
                  <Route path='/myChart' element={<MyChart></MyChart>}></Route>
                  <Route path='/panelSystemOverview' element={<PanelSystemOverview></PanelSystemOverview>}></Route>
            </Routes>
          </CSSTransition>
        </TransitionGroup>
        </BrowserRouter>
    </div>   
  );
}

export default App;
