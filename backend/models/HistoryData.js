import mongoose, {Schema} from "mongoose";

const HistoryDataSchema = new Schema({
    systemId: {
        type: String,
        required: true
    },

    locationName: {
        type: String,
        required: true
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel'
    },

    panelInstalledPower: {
        type: Number,
        required: true
    },

    batteryPower: {
        type: Number,
        required: true
    },

    batteryCapacity: {
        type: Number,
        required: true
    },

    batteryChargeLevel: {
        type: Number,
        required: true
    }, 

    batteryState: {
        type: String,
        enum: ['charging', 'discharging', 'inaction'],
        default: 'inaction'
    },

    sunset: {
        type: Date,
        required: true
    },

    sunrise: {
        type: Date,
        required: true
    },

    currentOutsideTemperature: {
        type: Number,
        required: true
    },

    currentCloudinessPercent: {
        type: Number,
        required: true
    },

    currentCellsTemperature: {
        type: Number,
        required: true
    },

    currentFunctionOfCellsTemperature: {
        type: Number,
        required: true
    },

    panelCurrentPower: {
        type: Number,
        required: true
    },

    timestamp: {
        type: Date,
        default: Date.now
    }

});

HistoryDataSchema.index({timestamp: 1});

const HistoryDataModel = mongoose.model('historyDataModels', HistoryDataSchema);
export default HistoryDataModel;