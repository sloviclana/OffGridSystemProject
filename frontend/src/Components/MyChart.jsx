import React from "react";
import {Line} from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LogarithmicScale, elements } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, PointElement, LineElement, Title, Tooltip, Legend);

const MyChart = ({data, battery}) => {
    const options = {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time (h)',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Energy (kWh)',
                },
                ticks: {
                    callback: function (value) {
                        return value;
                    },
                    stepSize: 1,
                    font: {
                        size: 10, // Smanji veličinu fonta ako je potrebno
                    },
                },
                grid: {
                    display: true, // Povećaj vidljivost grid linija
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                }
            },
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Consumption of energy (kWh) from user, and production of energy of panels and batteries',
            },
        },
        elements: {
            point: {
                radius: function(context) {
                    const index = context.dataIndex;
                    const datasetIndex = context.datasetIndex;

                    if (datasetIndex === 0) {
                        const panelProduction = context.chart.data.datasets[0].data[index];
                        const batteryChargeLevel = context.chart.data.datasets[1].data[index];
                        const consumption = context.chart.data.datasets[2].data[index];
                        const batteryCapacity = battery.capacity;

                        // Curenje energije uslov
                        if (panelProduction > consumption && 
                            panelProduction - consumption > (batteryCapacity - batteryChargeLevel)) {
                            return 8;
                        }

                        // Manjak energije uslov
                        if (consumption - panelProduction > batteryChargeLevel) {
                            return 8; 
                        }
                    }

                    return 3; 
                },

                color: function (context) {
                    const index = context.dataIndex;
                    const datasetIndex = context.datasetIndex;

                    // Proveri samo dataset za "Panel production" (koji je prvi dataset - index 0)
                    if (datasetIndex === 0) {
                        const panelProduction = context.chart.data.datasets[0].data[index];
                        const batteryChargeLevel = context.chart.data.datasets[1].data[index];
                        const consumption = context.chart.data.datasets[2].data[index];
                        const batteryCapacity = battery.capacity;

                        // Curenje energije (višak) uslov
                        if (panelProduction > consumption && 
                            panelProduction - consumption > (batteryCapacity - batteryChargeLevel)) {
                            return 'rgba(255, 0, 0, 1)'; // Boja tačke za curenje energije
                        }

                        // Manjak energije uslov
                        if (consumption - panelProduction > batteryChargeLevel) {
                            return 'rgba(255, 0, 0, 1)'; // Boja tačke za manjak energije
                        }
                    }

                    return 'rgba(75, 192, 192, 0.2)'; // Normalna boja tačke
                }
            }
        }
    };


    return <Line data={data} options={options} />;
};

export default MyChart;