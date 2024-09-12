import React from "react";
import { useState, useEffect } from "react";
import {blockUser, getAllUsers, unblockUser} from '../Services/UserService.js';
import { useNavigate } from "react-router-dom";
import { getAllPanelsForUser, getAllBatteriesForUser, getBatteryChargeLevelDataHistory, removePanelAndBatterySystem, getConsumptionDataHistory, getPanelProductionDataHistory } from "../Services/PanelBatteryService";

const AdminDashboard = () => {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [users, setUsers] = useState(null);
    const[panels, setPanels] = useState([]);
    const[batteries, setBatteries] = useState([]);
    const [usersVisible, setUsersVisible] = useState(null);
    const [panelsByUser, setPanelsByUser] = useState({});
    const [batteriesByUser, setBatteriesByUser] = useState({});

    const navigate = useNavigate();
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

    

    const handleShowUsers = async () => {
        const allUsers = await getAllUsers(userFromStorage._id, tokenFromStorage);
        setUsers(allUsers);
        setUsersVisible(true);
      };

    const handleShowPanelsOfUser = async(id) => {
        try {
            const allPanels = await getAllPanelsForUser(id, tokenFromStorage);
            const allBatteries = await getAllBatteriesForUser(id, tokenFromStorage);

            // Only update the state after data is fetched
            setPanelsByUser(prevState => ({
                ...prevState,
                [id]: allPanels,
            }));
            setBatteriesByUser(prevState => ({
                ...prevState,
                [id]: allBatteries,
            }));
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    }; 
    
    useEffect(() => {
        if (usersVisible) {
            users.forEach(user => {
                handleShowPanelsOfUser(user._id);
            });
        }
    }, [usersVisible, users]);

    const handleHideUsers = () => {
        setUsersVisible(false);
    };

    const handleShowChart = async(panelSystemId) => {
        const consumptionData = await getConsumptionDataHistory(tokenFromStorage);
        const panelProductionData = await getPanelProductionDataHistory(panelSystemId, tokenFromStorage, 3);
        const batteryChargeLevelData = await getBatteryChargeLevelDataHistory(panelSystemId, tokenFromStorage, 3);
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

        const dataToSend = {data, panelSystemId};
        navigate('/panelSystemOverview', {state: dataToSend});
    };

    const handleBlockUser = async(id) => {
        const blockedUser = await blockUser(id, tokenFromStorage);
        console.log(blockedUser);
        await handleShowUsers();
    };

    const handleRemovePanel = async(panelSystemId) => {
        const response = await removePanelAndBatterySystem(panelSystemId, tokenFromStorage);
        alert(response.message);
        await handleShowUsers();
    }

    const handleUnblock = async(id) => {
        const unblockedUser = await unblockUser(id, tokenFromStorage);
        console.log(unblockedUser);
        await handleShowUsers();
    }

    return (
        <div>
            <div className="centralDiv">
            <div className="adminDashboardDiv">
            {user === null ? (
                <h2>Welcome to your dashboard!</h2>
                            ) : (
                <h2>Welcome to your dashboard, <span className="highlight">{user.firstName}</span>!</h2>
                )}
            
           

            {usersVisible ? 
            (
                <>
                <h3>List of all users:</h3>
                    <ul>
                {users.map((user, index) => (
                    <li key={user._id}>
                        <div className="adminDashboardComponentDiv">
                            <h3>{user.firstName} {user.lastName}</h3>
                            <p> <strong>Email:</strong> {user.email}</p>
                            <p><strong>Is this user blocked? </strong> {user.isBlocked.toString() === 'false' ? 
                                            ('This user is NOT blocked') : ('This user IS blocked')}</p>
                            
                            <p>PanelSystems of user: </p>

                            <div className="columncontainer">
                                <div className="list-column">
                                    {panelsByUser[user._id] && panelsByUser[user._id].length > 0 ? (
                                                    <ul>
                                                        {panelsByUser[user._id].map((panel, index) => (
                                                            <li key={panel._id}>
                                                                <div className="dashboardDiv">
                                                                    <h3>{panel.systemId} panel</h3>
                                                                    <p><strong>Location latitude:</strong>  {panel.location.coordinates[0]}</p>
                                                                    <p><strong>Location longitude:</strong> {panel.location.coordinates[1]}</p>
                                                                    <p><strong>Installed power (kW):</strong> {panel.installedPower}</p>
                                                                    <p><strong>Current power (kW):</strong>  {panel.currentPower}</p>
                                                                    <button type="submit" onClick={() => handleRemovePanel(panel.systemId)} className="secondaryBtn">Remove this panel system</button>
                                                                    <button type="submit" onClick={() => handleShowChart(panel.systemId)} className="secondaryBtn">Get consumption and production data of this system</button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    ) : (
                                                        <p>No panels found.</p>
                                                    )}
                                </div>
                                <div className="list-column">
                                {batteriesByUser[user._id] && batteriesByUser[user._id].length > 0 ? (
                                                    <ul>
                                                        {batteriesByUser[user._id].map((battery, index) => (
                                                            <li key={battery._id}>
                                                                <div className="dashboardDiv">
                                                                    <h3>{battery.systemId} battery</h3>
                                                                    <p><strong>Location latitude:</strong>  {battery.location.coordinates[0]}</p>
                                                                    <p><strong>Location longitude:</strong> {battery.location.coordinates[1]}</p>
                                                                    <p><strong>Capacity (kWh): </strong> {battery.capacity}</p>
                                                                    <p><strong>Power (kW):</strong> {battery.power}</p>
                                                                    <p><strong>Charge level(kWh):</strong>{battery.chargeLevel}</p>
                                                                    <p><strong>Charging/discharging duration (h): </strong> {battery.chargingDuration}</p>
                                                                    <p><strong>State:</strong> {battery.state}</p>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p>No batteries found.</p>
                                                )}
                                </div>
                            </div>

                                {/* <button type="submit" className="secondaryBtn" onClick={() => handleShowPanelsOfUser(user._id)}>Show panel systems of this user</button>  */}
                                 

                            { user.isBlocked === false ? 
                                    ( <> 
                                    <button type="submit" onClick={() => handleBlockUser(user._id)} className="secondaryBtn">Block this user</button>
                                    </>) : (
                                    <button type="submit" onClick={() => handleUnblock(user._id)} className="secondaryBtn">Unblock this user</button>
                                    )}
                        </div>
                    </li>
                ))}
                </ul>
                
                <button type="button" onClick={handleHideUsers} className="primaryBtn">Hide users</button>
                </>
            ) 
            : 
            (
            <>
                <h3> Here you can preview all the users, their panels and batteries.</h3>

            <button type="submit" onClick={handleShowUsers} className="primaryBtn">Show users</button>
            </>
            )}
            </div>
            </div>
        </div>
    )
};

export default AdminDashboard;