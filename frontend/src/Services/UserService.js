import axios from "axios";
import UserModel from "../Models/UserModel.js";

const url = "http://localhost:5000";

export const logIn = async(email, password, token) => {
    try {
        const {data} = await axios.post(`${url}/auth/login`, JSON.stringify({email, password, token}),
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        return data;
    } 
    catch(error) {
        if(error.response && error.response.data) {
            throw new Error(error.response.data.message);
        }

        throw new Error("Logging in failed! Try again.");
    }

};

export const register = async (formData, token) => {

    try {
        const {data} = await axios.post(`${url}/auth/register`, JSON.stringify(formData, token),
        {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return data;
    }
    catch (error) {
        console.error(error);
        throw new Error('Registration failed! Try again.');
    }

};

