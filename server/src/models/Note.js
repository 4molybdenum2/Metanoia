const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoteSchema = new Schema({
    docName: { type: String, required: true, default: "Untitled" },
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
    collabs: { type: Array, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    lastModified: { type: Date, required: true, default: Date.now },
    contents:{type: Schema.Types.Mixed}
})

module.exports = mongoose.model('Note', NoteSchema);