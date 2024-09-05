import React, {useState, useEffect} from "react";
//import { useNavigate } from "react-router-dom";
import {getLastConstParameters, setNewConstantParameters} from '../Services/UserService.js';

const SetConstantParameters = () => {

    const[user, setUser] = useState();
    const[token, setToken] = useState();

    const userFromStorage = JSON.parse(sessionStorage.getItem('user'));
    const tokenFromStorage = sessionStorage.getItem('token');

    const [formData, setFormData] = useState({
        n: '',
        B: '',
        Tref: '',
        k: ''
      });

    useEffect(() => {

        if (userFromStorage) {
            setUser(userFromStorage);
        }
        if (tokenFromStorage) {
            setToken(tokenFromStorage);
        }

        const fetchData = async () => {
            try {
              const response = await getLastConstParameters(token);
              //const result = await response.json();
              setFormData({
                n: response.n,
                B: response.B,
                Tref: response.Tref,
                k: response.k
              });
            } catch (error) {
              console.error('Error fetching data:', error);
            }
          };
      
        fetchData();

    }, []);

    

  //const[error, setError] = useState(false);

  //const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const data = await setNewConstantParameters(formData, userFromStorage._id, token);
        if(data !== null){
        console.log(data);
        alert("Successfull setting new const parameters!");
        await getLastConstParameters();
      }
      else
      {
        window.alert('could not set new parameters!')
      }
    }
    catch (error) {
        console.error('Error:', error);
        window.alert('Setting parameters failed! Please try again.');
    }

  }

    return (
        <div className="homePageDiv">
            <div className="parametersDiv">
                <h2>Here you can enter or update constant parameters for calculating energy production:</h2>

                <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="n" ><strong>n (%):  </strong></label>
                    <input
                        type="number"
                        id="n"
                        name="n"
                        value={formData.n} 
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                <label htmlFor="B" ><strong>B:   </strong></label>
                <input
                    type="number"
                    id="B"
                    name="B"
                    value={formData.B} 
                    onChange={handleChange}
                    required
                />
                </div>

                <div>
                <label htmlFor="Tref" ><strong>Tref:   </strong></label>
                <input
                    type="number"
                    id="Tref"
                    name="Tref"
                    value={formData.Tref} 
                    onChange={handleChange}
                    required
                />
                </div>

                <div >
                <label htmlFor="k"><strong>k:   </strong></label>
                <input
                    type="number"
                    id="k"
                    name="k"
                    value={formData.k} 
                    onChange={handleChange}
                    required
                />
                </div>

                <button type="submit" className='secondaryBtn'>Set parameters</button>
          </form>
                
            </div>
        </div>
    );
};

export default SetConstantParameters;