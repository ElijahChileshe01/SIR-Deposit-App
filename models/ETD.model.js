const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
    Authors_last_name: {type: String},
    Authors_first_name: {type: String},
    Computer_Number: {type: Number},
    Supervisors_last_name: {type:String},
    Supervisors_first_name: {type: String},
    Examiners_last_name: {type: String},
    Examiners_first_name: {type: String},
    Title: {type: String},
    Subject:  {type: String},
    Abstract: {type: String},
    Publication_Date: {type: String},
    Additional_Comment: {type: String},
    Level_of_Study: {type: String},
    Type_of_Publication: {type: String},
    Faculty_School: {type:String},
    Department: {type: String},
    Document: {type: String},
});
//model
const ETDmodel = mongoose.model('form', formSchema);

//export schema
module.exports=ETDmodel;