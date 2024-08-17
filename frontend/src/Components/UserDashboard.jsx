import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { getAllPanelsForUser, getAllBatteriesForUser, removePanelAndBatterySystem } from "../Services/PanelBatteryService";


const UserDashboard = () => {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [refreshData, setRefreshData] = useState(false); // Dodajemo state za osvježavanje podataka
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


    const handleShowPanels = async () => {
        // Ovde dobavljaš panele, npr. fetchom
        // Nakon što dobaviš panele, možeš ih postaviti u stanje
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
        // Ovde dobavljaš panele, npr. fetchom
        // Nakon što dobaviš panele, možeš ih postaviti u stanje
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
        <div className="">
            <div className="">
            {user === null ? (
                <h2>Welcome to your dashboard!</h2>
                            ) : (
                <h2>Welcome to your dashboard, {user.firstName}!</h2>
                )}

            { panelsVisible ? (
            <>
                <ul>
                {panels.map((panel, index) => (
                    <li key={panel._id}>
                        <div className="dashboardDiv">
                            <h3>{panel.systemId}</h3>
                            <p>Location latitude: {panel.location.coordinates[0]}</p>
                            <p>Location longitude: {panel.location.coordinates[1]}</p>
                            <p>Installed power: {panel.installedPower}</p>
                            <p>Current power: {panel.currentPower}</p>
                            <button type="submit" onClick={() => handleRemovePanel(panel.systemId)} className="secondaryBtn">Remove this panel system</button>
                        </div>
                    </li>
                ))}
                </ul>
                
                <button type="button" onClick={handleHidePanels} className="primaryBtn">Hide panels</button>
            </>
                ) : (
            <>
            <p>Here you can preview all of your panels:</p>
            <button type="submit" onClick={handleShowPanels} className="primaryBtn">Show all my panels</button>
            </>
            )}

            { batteriesVisible ? (
            <>
                <ul>
                {batteries.map((battery, index) => (
                    <li key={battery._id}>
                        <div className="dashboardDiv">
                            <h3>{battery.systemId}</h3>
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
                
                <button type="button" onClick={handleHideBatteries} className="primaryBtn">Hide batteries</button>
            </>
                ) : (
            <>
            <p>Here you can preview all of your batteries:</p>
            <button type="submit" onClick={handleShowBatteries} className="primaryBtn">Show all my batteries</button>
            </>
            )}

            <p>Do you want to add new panel and battery system?</p>
            <button type="submit" className="secondaryBtn" onClick={redirectToLocationPicker}>Pick the location</button>
            </div>
        </div>
    );

};

export default UserDashboard;