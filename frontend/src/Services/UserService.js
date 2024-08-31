import axios from "axios";
//import UserModel from "../Models/UserModel.js";

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

export const getAllUsers = async(id, token) => {

    try {
        const response = await axios.post(`${url}/users/getAllUsers?id=${id}`,
        { 
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        return response.data;
    }
    catch(error) {
        console.error(error);
        throw new Error('Getting all users failed! Try again.');
    }
};

export const blockUser = async(id, token) => {
    try {
        const response = await axios.post(`${url}/users/blockUser?id=${id}`,
        { 
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        return response.data;
    }
    catch(error) {
        console.error(error);
        throw new Error('Blocking this user failed! Try again.');
    }
}

export const unblockUser = async(id, token) => {
    try {
        const response = await axios.post(`${url}/users/unblockUser?id=${id}`,
        { 
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        return response.data;
    }
    catch(error) {
        console.error(error);
        throw new Error('Unblocking this user failed! Try again.');
    }
}

export const getLastConstParameters = async(token) => {
    try {
        const response = await axios.get(`${url}/users/getLastConstParameters`,
            { 
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
    
            return response.data;
    } 
    catch (error) {
        console.error(error);
        throw new Error('Getting constant parameters failed! Try again.')
    }
}

export const setNewConstantParameters = async(formData, userId, token) => {
    try {
        const dataToSend = {
            userId: userId,
            ...formData
        };
        const response = await axios.post(`${url}/users/setNewConstParameters`, JSON.stringify(dataToSend),
            { 
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
    
            return response.data;
    }
    catch(error) {
        console.error(error);
        throw new Error('Setting constant parameters failed! Try again.');
    }
} 

