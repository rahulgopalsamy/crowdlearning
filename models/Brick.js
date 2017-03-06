var mongoose = require('mongoose');

var BrickSchema = mongoose.Schema({
    brickname :{type:String, unique:true, required:true},
    description:{type:String},
    _class:{type: mongoose.Schema.Types.ObjectId, ref:'Class', required:true},
    _questions:[{type: mongoose.Schema.Types.ObjectId, ref:'Question'}],
    created_at:{type:Date, default:Date.now}
});



module.exports = mongoose.model('Brick', BrickSchema);
