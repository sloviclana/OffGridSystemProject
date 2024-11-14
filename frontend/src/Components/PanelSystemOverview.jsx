import React from "react";
import MyChart from "./MyChart";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import {getPanelProductionDataHistory, getBatteryBySystemId, findNameOfLocation} from "../Services/PanelBatteryService";


const PanelSystemOverview = () => {
    const location = useLocation();
    const receivedDataFromLocation = location.state;
    const [chartData, setChartData] = useState(receivedDataFromLocation.data); // Stanje za podatke grafikona
    const [battery, setBattery] = useState(receivedDataFromLocation.battery); // Stanje za podatke o bateriji
    const numbers = Array.from({ length: 28 }, (_, i) => i + 3);
    const tokenFromStorage = sessionStorage.getItem('token');
    const [selectedNumber, setSelectedNumber] = useState(null);
    let panelSystemId = receivedDataFromLocation.panelSystemId;
    let [panelLocation, setPanelLocation] = useState('');

    const handleSelectChange = (event) => {
        setSelectedNumber(event.target.value); // Postavlja vrednost izabranog broja
      };

    const handleShowChart = async() => {
        const panelProductionData = await getPanelProductionDataHistory(panelSystemId, tokenFromStorage, selectedNumber);
        const batteryData = await getBatteryBySystemId(panelSystemId);
        //const location = await findNameOfLocation(panelSystemId);
        setPanelLocation(panelProductionData.locationName);

        const data = {
            labels: panelProductionData.labels,
            datasets: [
                {
                    label: 'Panel production',
                    data: panelProductionData.productionData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Battery charge level',
                    data: panelProductionData.batteryChargeLevelData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'User consumption',
                    data: panelProductionData.consumptionData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.4,
                }
            ]
        };

        setChartData(data);
        setBattery(batteryData);
    };

    return (
        <div className="centralDiv">
            <div className="myChartDiv">
                <h1>Panel System Energy Overview for system: {panelSystemId}</h1>
                <p>Show for  
                    <select value={selectedNumber} onChange={handleSelectChange}>
                        <option disabled value={3}>
                            Choose number of days (default: 3)
                        </option>
                        {numbers.map((num) => (
                            <option key={num} value={num}>
                            {num}
                            </option>
                        ))}
                </select> days ago    

                <button type="submit" onClick={handleShowChart}>Show</button>
                </p> 
                <MyChart data={chartData} battery={battery}></MyChart>
            </div>
        </div>
    );
};

export default PanelSystemOverview;