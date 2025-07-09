//require mongoose
const { create } = require('domain');
const mongoose = require('mongoose');
const { type } = require('os');
// define the schema
const Schema= mongoose.Schema
// user schema
const userSchema = new Schema({
    name:String,
    email:{type:String, required:true, unique:true},
    dob:{type:Date,default:Date.now},
    password:{type:String, required:true},
    photo:{type:String},
})
//employee schema
const employeeSchema = new Schema({
    userId:{type:Schema.Types.ObjectId, ref:'User', default:null},
    firstName:{type:String},
    lastName:{type:String},
    email:{type:String, required:true, unique:true},
    taskId:{type:Schema.Types.ObjectId, ref:'Task', default:null},
    taskTitle: { type: String },
    hireDate:{type:Date},
    salary:{type:Number},
    createdAt:{type:Date, default:Date.now},
    updatedAt:{type:Date, default:Date.now}
})

//task schema
const taskSchema = new Schema({
    title:{type:String, required:true},
    description:{type:String},
    assignedTo:{type:Schema.Types.ObjectId, ref:'Employee'},
    status:{type:String,default:'pending'},
    salary:{type:Number},
    dueDate:{type:Date, default: () => {
            const date = new Date();
            date.setDate(date.getDate() + 3); // adds 3 days
            return date;
        }},
    createdAt:{type:Date, default:Date.now},
    updatedAt:{type:Date, default:Date.now}
})


const User = mongoose.model('User', userSchema);
const Employee = mongoose.model('Employee', employeeSchema);
const Task = mongoose.model('Task', taskSchema);

//export the schemas
module.exports = {User,Employee,Task}
