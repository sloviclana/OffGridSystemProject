import mongoose, {Schema} from "mongoose";

const ConsumptionDataSchema = new Schema({
    systemId: {
        type: String,
        required: true
    }, 

    dailyValue: {
        type: Number,
        required: true
    },

    currentConsumption: {
        type: Number, 
        required: true
    }, 

    timestamp: {
        type: Date, 
        default: Date.now
    }
});

const ConsumptionDataModel = mongoose.model('ConsumptionData', ConsumptionDataSchema);

export default ConsumptionDataModel;