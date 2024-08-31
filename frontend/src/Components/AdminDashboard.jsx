import React from "react";
import { useState, useEffect } from "react";
import {blockUser, getAllUsers, unblockUser} from '../Services/UserService.js';
import { getAllPanelsForUser, getAllBatteriesForUser, removePanelAndBatterySystem } from "../Services/PanelBatteryService.js";


const AdminDashboard = () => {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [users, setUsers] = useState(null);
    const[panels, setPanels] = useState([]);
    const[batteries, setBatteries] = useState([]);
    const [usersVisible, setUsersVisible] = useState(null);
    const [panelsByUser, setPanelsByUser] = useState({});
    const [batteriesByUser, setBatteriesByUser] = useState({});


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
            <div>
            {user === null ? (
                <h2>Welcome to your dashboard!</h2>
                            ) : (
                <h2>Welcome to your dashboard, {user.firstName}!</h2>
                )}

            {usersVisible ? 
            (
                <>
                    <ul>
                {users.map((user, index) => (
                    <li key={user._id}>
                        <div className="dashboardDiv">
                            <h3>{user.firstName} {user.lastName}</h3>
                            <p>Email: {user.email}</p>
                            <p>Is this user blocked? {user.isBlocked.toString() === 'false' ? 
                                            ('this user is not blocked') : ('this user is blocked')}</p>
                            
                            <p>PanelSystems of user: </p>

                            <div className="columncontainer">
                                <div className="list-column">
                                    {panelsByUser[user._id] && panelsByUser[user._id].length > 0 ? (
                                                    <ul>
                                                        {panelsByUser[user._id].map((panel, index) => (
                                                            <li key={panel._id}>
                                                                <div className="dashboardDiv">
                                                                    <h3>{panel.systemId} panel</h3>
                                                                    <p>Location latitude: {panel.location.coordinates[0]}</p>
                                                                    <p>Location longitude: {panel.location.coordinates[1]}</p>
                                                                    <p>Installed power: {panel.installedPower}</p>
                                                                    <p>Current power: {panel.currentPower}</p>
                                                                    <button type="submit" onClick={() => handleRemovePanel(panel.systemId)} className="secondaryBtn">Remove this panel system</button>
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
                                                                    <p>Location latitude: {battery.location.coordinates[0]}</p>
                                                                    <p>Location longitude: {battery.location.coordinates[1]}</p>
                                                                    <p>Capacity: {battery.capacity}</p>
                                                                    <p>Power: {battery.power}</p>
                                                                    <p>Charge level: {battery.chargeLevel}</p>
                                                                    <p>Charging duration: {battery.chargingDuration}</p>
                                                                    <p>Disharging duration: {battery.dischargingDuration}</p>
                                                                    <p>State: {battery.state}</p>
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
    )
};

export default AdminDashboard;