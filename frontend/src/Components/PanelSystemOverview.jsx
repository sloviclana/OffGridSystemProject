import React from "react";
import MyChart from "./MyChart";
import { useLocation } from "react-router-dom";

const PanelSystemOverview = () => {
    const location = useLocation();
    const receivedData = location.state;

    return (
        <div className="centralDiv">
            <div className="myChartDiv">
                <h1>Panel System Energy Overview for system: {receivedData.panelSystemId}</h1>
                <MyChart data={receivedData.data} battery={receivedData.battery}></MyChart>
            </div>
        </div>
    );
};

export default PanelSystemOverview;