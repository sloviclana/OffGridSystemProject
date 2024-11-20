import React from "react";
import MyChart from "./MyChart";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import {getPanelProductionDataHistory, getBatteryBySystemId, generateHistoryDataReport, getPredictions} from "../Services/PanelBatteryService";
import DataRangePicker from './DataRangePicker';
import PowerPredictionChart from "./PowerPredictionChart";
import { formToJSON } from "axios";

const PanelSystemOverview = () => {
    const location = useLocation();
    const receivedDataFromLocation = location.state;
    const [chartData, setChartData] = useState(receivedDataFromLocation.data); // Stanje za podatke grafikona
    const [battery, setBattery] = useState(receivedDataFromLocation.battery); // Stanje za podatke o bateriji
    const numbers = Array.from({ length: 28 }, (_, i) => i + 3);
    const tokenFromStorage = sessionStorage.getItem('token');
    const [selectedNumber, setSelectedNumber] = useState(null);
    let panelSystemId = receivedDataFromLocation.panelSystemId;
    const [selectedRange, setSelectedRange] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [predictionsData, setPredictionsData] = useState(null);
    const [isPredictionDone, setIsPredictionDone] = useState(false);

    const handleSelectChange = (event) => {
        setSelectedNumber(event.target.value); // Postavlja vrednost izabranog broja
      };

      const handleDateRangeSelect = async (range) => {
        setSelectedRange(range);
        const result = await generateHistoryDataReport(range.startDate, range.endDate, panelSystemId);
        alert(result);
        console.log('Izabrani interval:', range);
      };

    const handleShowPredictions = async(panelSystemId) => {
        const result = await getPredictions(panelSystemId);
        
        const res = JSON.parse(result);
        console.log('Predictions: ' + res);
        setPredictionsData(res);
        if(res !== null) {
            setIsPredictionDone(true);
        }
      };
    
    
    const handleShowChart = async() => {
        const panelProductionData = await getPanelProductionDataHistory(panelSystemId, tokenFromStorage, selectedNumber);
        const batteryData = await getBatteryBySystemId(panelSystemId);

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
                <div className="container">
                    <div className="leftColumn">
                        <div className="numberOfDaysForChartDiv">
                        <h3>Pick the starting day for the chart</h3>
                        <p>
                            Show for  
                            <input 
                            type="number" 
                            value={selectedNumber} 
                            onChange={handleSelectChange} 
                            placeholder="Choose number of days"
                            />
                            days ago
                        </p>
                        <button 
                            type="submit" 
                            onClick={handleShowChart}
                            disabled={!selectedNumber || selectedNumber <= 0}
                        >
                            Show
                        </button>
                        </div>

                        <div className="dateRangePickerDiv">
                        <p>
                            You can generate history report for this panel system: 
                            <DataRangePicker onDateRangeSelect={handleDateRangeSelect} />
                        </p> 
                        </div>
                    </div>

                    <div className="rightColumn">
                        <div className="predictionDiv">
                        <p>
                            You can see predictions for this panel system energy production
                            <button onClick={() => handleShowPredictions(panelSystemId)}>
                            Show predictions
                            </button>

                            {isPredictionDone ? (
                            <div>
                                <PowerPredictionChart chartData={predictionsData} />
                            </div>
                            ) : (
                            <p></p>
                            )}
                        </p>
                        </div>
                    </div>
                    </div>
                <MyChart data={chartData} battery={battery}></MyChart>
            </div>
        </div>
    );
};

export default PanelSystemOverview;