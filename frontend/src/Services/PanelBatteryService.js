import axios from 'axios';
const API_BASE_URL = "http://localhost:5004";
const API_BASE_URL2 = "http://localhost:5005";
const API_BASE_URL3 = "http://localhost:5008";

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
        const response = await axios.post(`${API_BASE_URL2}/batteries/getAllBatteriesFromUser?id=${id}`,
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

export const getConsumptionDataHistory = async(token) => {

  try {
    const response = await axios.get(`${API_BASE_URL}/panels/getConsumptionDataHistory`,
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
    console.error("Couldn't get consumption data!");
    throw error;
  }

};

export const getPanelProductionDataHistory = async(id, token, days) => {
  try {
    const response = await axios.get(`${API_BASE_URL3}/historyData/getPanelProductionDataHistory?systemId=${id}&days=${days}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
          }
      }
      );
      return response.data;
  }
  catch(error) {
    console.error("Couldn't get panel production data!");
    throw error;
  }
};

export const getBatteryChargeLevelDataHistory = async(id, token, days) => {
  try {
    const response = await axios.get(`${API_BASE_URL3}/panels/getBatteryChargeLevelDataHistory?systemId=${id}&days=${days}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
          }
      }
      );
      return response.data;
  }
  catch(error) {
    console.error("Couldn't get panel production data!");
    throw error;
  }
};

export const getBatteryBySystemId = async (systemId, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL2}/batteries/getBatteryBySystemId?systemId=${systemId}`,
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
    console.error("Couldn't get battery for this id!");
    throw error;
  }
};

export const findNameOfLocation = async(systemId) => {
  try {
    const response = await axios.get(`${API_BASE_URL3}/historyData/findNameOfLocation`,
      {
        params : {
          systemId: systemId
        } 
      }
      );
      return response.data;
  }
  catch (error) {
    console.error("Couldn't get battery for this id!");
    throw error;
  }
};

export const generateHistoryDataReport = async(timestamp1, timestamp2, systemId) => {
  try {
    const response = await axios.post(`${API_BASE_URL3}/historyData/generateHistoryDataReport`,
      {
        params: {
          timestamp1: timestamp1,
          timestamp2: timestamp2,
          systemId: systemId
        }
      }
    );
    return response.data;
  }
  catch (error) {
    console.error("Couldn't generate history report for panel system " + systemId + " !");
    throw error;
  }

};

export const getPredictions = async(panelSystemId) => {
  try {
    const response = await axios.post(`${API_BASE_URL3}/historyData/getForecast`,
      {
        params: {
          systemId: panelSystemId
        }
      }
    );
    return response.data;
  }
  catch (error) {
    console.error("Couldn't get energy production predictions for panel system " + panelSystemId + " !");
    throw error;
  }
};


