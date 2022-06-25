const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const phaseSchema= new Schema({

  phase:{
    type: String,
    uniqe: true
  }
   
})

module.exports = mongoose.model('Phase', phaseSchema);
