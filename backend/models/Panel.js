import mongoose, { Schema } from 'mongoose';

const PanelSchema = new mongoose.Schema ({
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

    installedPower: {
        type: Number,
        required: true
    },

    currentPower: {
        type: Number,
        required: true
    },

    systemId: {
        type: String,
        required: true
    }
});

PanelSchema.index({location: '2dsphere'});

//const PanelModel = mongoose.Model('panels', PanelSchema);
//export default PanelModel;

const PanelModel = mongoose.model('panels', PanelSchema);
export default PanelModel;