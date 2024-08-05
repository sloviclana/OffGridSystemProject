import mongoose, { Schema } from 'mongoose';

const BatterySchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'UserModel',
        required: true
    },

    location: {
        type: {
            type: String, 
            enum: ['Point'],
            required: true
        },

        coordinates: {
            type: [Number],
            required: true
        }
    },

    capacity: {
        type: Number,
        required: true
    },

    power: {
        type: Number,
        required: true
    }, 

    chargeLevel: {
        type: Number,
        default: 0
    }, 

    chargingDuration: {
        type: Number, 
        required: true
    }, 

    dischargeDuration: {
        type: Number,
        required: true
    },

    state: {
        type: String,
        enum: ['charging', 'discharging', 'inaction']
    },

    systemId: {
        type: String,
        required: true
    }
});

BatterySchema.index({location : '2dsphere'});

const BatteryModel = mongoose.model('batteries', BatterySchema);
export default BatteryModel;

