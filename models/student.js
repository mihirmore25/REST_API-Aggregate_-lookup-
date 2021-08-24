const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost:27017/studentDB",
    {
        useFindAndModify: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    }
).then(() => console.log("Database is connected successfully..."))
    .catch(err => console.log(err));


const studentSchema = Schema({
    _id: Schema.Types.ObjectId,
    firstName: String,
    age: Number,
    rollNo: Number,
    studentMarks: [
        { type: Schema.Types.ObjectId, ref: 'Mark' }
    ]
});

const marksSchema = Schema({
    student_id: { type: Schema.Types.ObjectId, ref: 'Student' },
    english: Number,
    maths: Number,
    computerScience: Number
});

const Student = mongoose.model('Student', studentSchema);
const Mark = mongoose.model('Mark', marksSchema);

module.exports = {
    Student,
    Mark
};