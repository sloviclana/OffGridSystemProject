import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registruj Chart.js komponente
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PowerPredictionChart = ({ chartData }) => {
  // Ekstraktuj podatke
  const timestamps = chartData.map((item) =>
    new Date(item.timestamp).toLocaleString()
  );
  const predictedPowers = chartData.map((item) => item.predicted_power);

  // Definiši podatke za Chart.js
  const data = {
    labels: timestamps, // Koristi formatirane datume kao oznake
    datasets: [
      {
        label: "Predicted Power",
        data: predictedPowers,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Predicted Power vs Time",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Timestamp",
        },
      },
      y: {
        title: {
          display: true,
          text: "Predicted Power",
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default PowerPredictionChart;
