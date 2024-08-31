import React from "react";
import {Line} from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LogarithmicScale } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, PointElement, LineElement, Title, Tooltip, Legend);

const MyChart = ({data}) => {
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
            }
        },
    };

    return <Line data={data} options={options} />;
};

export default MyChart;