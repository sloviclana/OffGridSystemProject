import mongoose, {Schema} from 'mongoose';

const ConstantParametersSchema = new Schema({

    n: {
        type: Number,
        default: 18
    },

    B: {
        type: Number,
        default: 0.005
    },

    Tref: {
        type: Number,
        default: 25
    },

    k: {
        type: Number,
        default: 0.02
    },

    adminInput: {
        type: Schema.Types.ObjectId,
        ref: 'UserModel',
        required: true
    },

    timestamp: {
        type: Date, 
        default: Date.now
    }
});

ConstantParametersSchema.index({timestamp : 1});

const ConstantParametersModel = mongoose.model('constantParameters', ConstantParametersSchema);
export default ConstantParametersModel;