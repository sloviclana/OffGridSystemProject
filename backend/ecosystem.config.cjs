module.exports = {
    apps: [
      {
        name: 'UserAuthService',
        script: 'Services/UserAuthService/service.js',
        watch: true,
        windowsHide: true, // Hide the console window
      },
      {
        name: 'UsersService',
        script: 'Services/UsersService/service.js',
        watch: true,
        windowsHide: true, // Hide the console window
      },
      {
        name: 'ConstantParametersService',
        script: 'Services/ConstantParametersService/service.js',
        watch: true,
        windowsHide: true, // Hide the console window
      },
      {
        name: 'PanelsService',
        script: 'Services/PanelsService/service.js',
        watch: true,
        windowsHide: true, // Hide the console window
      },
      {
        name: 'BatteriesService',
        script: 'Services/BatteriesService/service.js',
        watch: true,
        windowsHide: true, // Hide the console window
      },
      {
        name: 'EnergyConsumptionService',
        script: 'Services/EnergyConsumptionService/service.js',
        watch: true,
        windowsHide: true, // Hide the console window
      },
      {
        name: 'HistoryDataService',
        script: 'Services/HistoryDataService/service.js',
        watch: true,
        windowsHide: true, // Hide the console window
      },
      {
        name: "ForecastPredictionService", // Name of your service
        script: "waitress-serve",          // Command to run Waitress
        args: "--host=127.0.0.1 --port=5009 app:app", // Arguments for Waitress
        interpreter: "none",               // Ensures PM2 doesn't use Node.js to interpret this
        cwd: "./Services/ForecastPredictionService", // Directory of your Flask app
        env: {
          // Environment variables, if needed
          FLASK_ENV: "production",
        },
        windowsHide: true, // Hide the console window
      }
      /* {
        name: 'ForecastPredictionService',
        script: 'Services/ForecastPredictionService/app.py',
        watch: true
      } */
    ],
  };