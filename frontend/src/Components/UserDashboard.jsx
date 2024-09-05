import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { getAllPanelsForUser, getAllBatteriesForUser, 
    getBatteryChargeLevelDataHistory, removePanelAndBatterySystem, 
    getConsumptionDataHistory, getPanelProductionDataHistory, getBatteryBySystemId } from "../Services/PanelBatteryService";

const UserDashboard = () => {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    //const [refreshData, setRefreshData] = useState(false); // Dodajemo state za osvježavanje podataka
    const [panels, setPanels] = useState([]);
    const [batteries, setBatteries] = useState([]);
    const [panelsVisible, setPanelsVisible] = useState(false);
    const [batteriesVisible, setBatteriesVisible] = useState(false);

    const userFromStorage = JSON.parse(sessionStorage.getItem('user'));
    const tokenFromStorage = sessionStorage.getItem('token');

    useEffect(() => {
        
        if (userFromStorage) {
            setUser(userFromStorage);
        }
        if (tokenFromStorage) {
            setToken(tokenFromStorage);
        }
    }, []);

    const handleShowChart = async(panelSystemId) => {
        const consumptionData = await getConsumptionDataHistory(tokenFromStorage);
        const panelProductionData = await getPanelProductionDataHistory(panelSystemId, tokenFromStorage);
        const batteryChargeLevelData = await getBatteryChargeLevelDataHistory(panelSystemId, tokenFromStorage);
        const battery = await getBatteryBySystemId(panelSystemId);
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
                    data: batteryChargeLevelData.chargeLevelData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'User consumption',
                    data: (consumptionData.concat(consumptionData)).concat(consumptionData),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.4,
                }
            ]
        };

        const dataToSend = {data, panelSystemId, battery};
        navigate('/panelSystemOverview', {state: dataToSend});
    };

    const handleShowPanels = async () => {
        const allPanels = await getAllPanelsForUser(userFromStorage._id, tokenFromStorage);
        setPanels(allPanels);
        setPanelsVisible(true);
      };
    
    const handleHidePanels = () => {
        setPanelsVisible(false);
    };

    const handleRemovePanel = async (systemId) => {
        const response = await removePanelAndBatterySystem(systemId, tokenFromStorage);
        alert(response.message);
        window.location.reload();
    }

    const handleShowBatteries = async () => {
        const allBatteries = await getAllBatteriesForUser(userFromStorage._id, tokenFromStorage);
        setBatteries(allBatteries);
        setBatteriesVisible(true);
      };
    
    const handleHideBatteries = () => {
        setBatteriesVisible(false);
    };
    

    const redirectToLocationPicker = () => {
        navigate('/locationPicker');
      };

    return (
        <div className="homePageDiv">
            <div className="">
                <div>
                {user === null ? (
                <h2 className="title1">Welcome to your dashboard!</h2>
                            ) : (
                <h2 className="title1">Welcome to your dashboard, {user.firstName}!</h2>
                )}
                </div>
            

            <div className="dashboardComponentDiv">
            <h2>Your panels</h2>
            { panelsVisible ? 
            ( <>
                {panels.length === 0 ?
                (<p>No panels found.</p>) : 
                (
                    <>
                    <ul>
                    {panels.map((panel, index) => (
                        <li key={panel._id}>
                            <div className="dashboardDiv">
                                <h3>{panel.systemId}</h3>
                                <p> <strong>Location latitude:</strong> {panel.location.coordinates[0]}</p>
                                <p><strong>Location longitude:</strong> {panel.location.coordinates[1]}</p>
                                <p><strong>Installed power (kW):</strong> {panel.installedPower}</p>
                                <p><strong>Current power (kW):</strong> {panel.currentPower}</p>
                                <button type="submit" onClick={() => handleRemovePanel(panel.systemId)} className="secondaryBtn">Remove this panel system</button>
                                <button type="submit" onClick={() => handleShowChart(panel.systemId)} className="secondaryBtn">Get consumption and production data of this system</button>
                            </div>
                        </li>
                    ))}
                    </ul>
                </>
            )}  
            <button type="button" onClick={handleHidePanels} className="primaryBtn">Hide panels</button>
            </>  
                ) : (
            <>
            <p>Here you can preview all of your panels:</p>
            <button type="submit" onClick={handleShowPanels} className="primaryBtn">Show all my panels</button>
            </>
            )}
            </div>

            <div className="dashboardComponentDiv">
            <h2>Your batteries</h2>
            { batteriesVisible ? (
            <>
                {batteries.length === 0 ? 
                (<p>No batteries found.</p>) : 
                (
                    <ul>
                    {batteries.map((battery, index) => (
                        <li key={battery._id}>
                            <div className="dashboardDiv">
                                <h3>{battery.systemId}</h3>
                                <p> <strong>Location latitude:</strong> {battery.location.coordinates[0]}</p>
                                <p><strong>Location longitude:</strong> {battery.location.coordinates[1]}</p>
                                <p><strong>Capacity (kWh): </strong>{battery.capacity}</p>
                                <p><strong>Power (kW):</strong> {battery.power}</p>
                                <p><strong>Charge level(kWh):</strong> {battery.chargeLevel}</p>
                                <p><strong>Charging/discharging duration (h): </strong>{battery.chargingDuration}</p>
                                <p><strong>State:</strong> {battery.state}</p>
                            </div>
                        </li>
                    ))}
                    </ul>
                    )}
                
                <button type="button" onClick={handleHideBatteries} className="primaryBtn">Hide batteries</button>
            </>
                ) : (
            <>
            <p>Here you can preview all of your batteries:</p>
            <button type="submit" onClick={handleShowBatteries} className="primaryBtn">Show all my batteries</button>
            </>
            )}
            </div>

            <p>Do you want to add new panel and battery system?</p>
            <button type="submit" className="secondaryBtn" onClick={redirectToLocationPicker}>Pick the location</button>
            </div>
        </div>
    );

};

export default UserDashboard;