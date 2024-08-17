import axios from 'axios';
const API_BASE_URL = "http://localhost:5000";

export const getAllPanelsForUser = async (id, token) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/panels/getAllPanelsFromUser?id=${id}`,
          {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
      } catch (error) {
        console.error('Error with getting all panels for user with id:' + id, error);
        throw error;
      }

};

export const getAllBatteriesForUser = async (id, token) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/panels/getAllBatteriesFromUser?id=${id}`,
        {
          headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
          }
        }
      );
        return response.data;
      } catch (error) {
        console.error('Error with getting all batteries for user with id:' + id, error);
        throw error;
      }
};

export const removePanelAndBatterySystem = async (systemId, token) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/panels/deletePanelBatterySystem?systemId=${systemId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
        }
    }
    );
    return response.data;
  }
  catch (error) {
    console.error('Error with deleting panel system with id:' + systemId, error);
    throw error;
  }
};