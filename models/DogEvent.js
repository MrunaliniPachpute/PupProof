const mongoose = require("mongoose");

const DogEventSchema = new mongoose.Schema({
  phash : {
    type : String,
    required : true
  },
  isPuppy : {
    type : Boolean,
    required : true
  },
  foodDurationSec : {
    type : Number,
    required  :true
  },
  timeStamp : {
    type : Date,
    default : Date.now
  },
  expiresAt : {
    type : Date,
    required : true 
  },
  noseCid : {
    type  :String //IPFS CID
  }
});

DogEventSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('DogEvent', DogEventSchema);