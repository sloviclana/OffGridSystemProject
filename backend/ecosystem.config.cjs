module.exports = {
    apps: [
      {
        name: 'UserAuthService',
        script: 'Services/UserAuthService/service.js',
        watch: true,
      },
      {
        name: 'UsersService',
        script: 'Services/UsersService/service.js',
        watch: true,
      },
      {
        name: 'ConstantParametersService',
        script: 'Services/ConstantParametersService/service.js',
        watch: true
      },
      {
        name: 'PanelsService',
        script: 'Services/PanelsService/service.js',
        watch: true
      },
      {
        name: 'BatteriesService',
        script: 'Services/BatteriesService/service.js',
        watch: true
      },
      {
        name: 'EnergyConsumptionService',
        script: 'Services/EnergyConsumptionService/service.js',
        watch: true
      },
      {
        name: 'HistoryDataService',
        script: 'Services/HistoryDataService/service.js',
        watch: true
      },
      {
        name: 'WeatherDataService',
        script: 'Services/WeatherDataService/service.js',
        watch: true
      },
    ],
  };