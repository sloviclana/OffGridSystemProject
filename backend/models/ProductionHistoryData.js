import mongoose, {Schema} from "mongoose";

const PanelProductionHistoryDataSchema = new Schema({
    panelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PanelModel'
    }, 

    timestamp: {
        type: Date,
        default: Date.now
    },

    currentPower: {
        type: Number
    }, 

    systemId: {
        type: String
    }, 

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel'
    }
});

const BatteryProductionHistoryDataSchema = new Schema({
    batteryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BatteryModel'
    }, 

    timestamp: {
        type: Date,
        default: Date.now
    },

    state: {
        type: String,
        enum: ['charging', 'discharging', 'inaction'],
        default: 'inaction'
    },

    chargeLevel: {
        type: Number
    },

    systemId: {
        type: String
    }, 

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel'
    }
});

const PanelProductionHistoryDataModel = mongoose.model('PanelProductionHistoryData', PanelProductionHistoryDataSchema);
const BatteryProductionHistoryDataModel = mongoose.model('BatteryProductionHistoryData', BatteryProductionHistoryDataSchema);

export { PanelProductionHistoryDataModel, BatteryProductionHistoryDataModel };