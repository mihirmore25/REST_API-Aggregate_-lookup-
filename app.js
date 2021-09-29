const express = require("express");
const mongoose = require("mongoose");
const { Student, Mark } = require("./models/student");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.route("/students")
    .get(async (req, res) => {
        try {
            const students = await Student.find({}).populate("studentMarks");
            res.send(students);
        } catch (error) {
            res.send(error);
        }
    })

    .post(async (req, res) => {
        try {
            const newStudent = new Student({
                _id: new mongoose.Types.ObjectId(),
                firstName: req.body.firstName,
                age: req.body.age,
                rollNo: req.body.rollNo
            });

            const student = await newStudent.save();
            res.send(`New student is created ${student}`);

        } catch (error) {
            res.send(error);
        }
    })

    .put((req, res) => {
        res.statusCode = 403;
        res.setHeader("Content-Type", "application/json");
        res.json({
            Unsuccessful: `PUT request is not supported on /students`
        });
    })

    .delete(async (req, res) => {

        try {
            const deletedStudentCount = await Student.deleteMany({});
            res.send(deletedStudentCount);
        } catch (error) {
            res.send(error);
        }

    });


app.route("/students/:studentId")
    .get(async (req, res) => {
        try {
            const student = await Student.findOne({ _id: req.params.studentId }).populate("studentMarks");
            res.send(student);
        } catch (error) {
            res.send(error);
        }
    })

    .post((req, res) => {
        res.statusCode = 403;
        res.setHeader("Content-Type", "application/json");
        res.json({
            Unsuccessful: `POST request is not supported on /students/${req.params.studentId}`
        });
    })

    .put(async (req, res) => {

        try {
            const updatedStudent = await Student.updateOne({ _id: req.params.studentId },
                {
                    $set: {
                        firstName: req.body.firstName,
                        age: req.body.age,
                        rollNo: req.body.rollNo,
                        studentMarks: [req.body.studentMarks]
                    }
                },
            );
            res.send(updatedStudent);

        } catch (error) {
            res.send(error);
        }
    })

    .delete(async (req, res) => {
        try {
            const deletedStudentCount = await Student.deleteOne({ _id: req.params.studentId });
            res.send(deletedStudentCount);
        } catch (error) {
            res.send(error);
        }
    });


app.route("/students/:studentId/studentMarks")
    .get(async (req, res) => {
        try {
            const marks = await Mark.findOne({ student_id: req.params.studentId });
            res.send(marks);
        } catch (error) {
            res.send(error);
        }
    })

    .post(async (req, res) => {
        const studentMark = new Mark({
            student_id: req.params.studentId,
            english: req.body.english,
            maths: req.body.maths,
            computerScience: req.body.computerScience
        });

        await studentMark.save();

        Mark.findOne({ student_id: req.params.studentId })
            .populate("student_id")
            .exec((err, marks) => {
                if (err) {
                    res.send(err);
                }

                Student.findOne({ _id: req.params.studentId }, (err, student) => {
                    if (err) {
                        res.send(err);
                    }

                    student.studentMarks.push(marks._id);
                    student.save();
                    res.send(student);
                });
            });
    })

    .put(async (req, res) => {
        try {
            const updatedStudentMarks = await Mark.updateOne({ student_id: req.params.studentId },
                {
                    $set: {
                        firstName: req.body.firstName,
                        age: req.body.age,
                        rollNo: req.body.rollNo,
                        studentMarks: [req.body.studentMarks]
                    }
                },
            );

            res.send(updatedStudentMarks);
        } catch (error) {
            res.send(error);
        }
    })

    .delete(async (req, res) => {
        try {
            const deletedStudentCount = await Mark.deleteOne({ student_id: req.params.studentId });
            res.send(deletedStudentCount);
        } catch (error) {
            res.send(error);
        }
    });


app.get("/studentsMarks/aggregate", async (req, res) => {
    try {
        const result = await Student.aggregate([
            {
                $lookup: {
                    from: "marks",
                    localField: "_id",
                    foreignField: "student_id",
                    as: "studentMarks"
                }
            },
            {
                $match: { $or: [{ "computerScience": { $gt: 70 } }, { "age": 21 }] }
            }
        ]);

        res.send(result);
        
    } catch (error) {
        res.send(error);
    }
});








// Aggregation
// Student.aggregate([
//     {
//         $lookup: {
//             from: "marks",
//             localField: "_id",
//             foreignField: "student_id",
//             as: "studentMarks"
//         }
//     },
//     { $unwind: "$studentMarks" }
// ]).exec((err, student) => {
//     if (err) console.error(err);

//     console.log(student);

//     for (let i = 0; i <= student.length - 1; i++) {
//         // console.log(student[i].studentMarks.commputerScience);

//         if (student[i].studentMarks.commputerScience > 70) {
//             console.log(`${student[i].firstName} is having higher score of ${student[i].studentMarks.commputerScience} in computer science!`);
//         } else if (student[i].studentMarks.commputerScience < 30) {
//             console.log(`${student[i].firstName} is having lower score of ${student[i].studentMarks.commputerScience} in computer science!`);
//         }
//     }
// });

// .post((req, res) => {
//     Student.findOne({ _id: req.params.studentId })
//         .then(student => {
//             if (student != null) {

//                 // console.log(student);

//                 const studentMark = new Mark({
//                     student_id: student._id,
//                     english: req.body.english,
//                     maths: req.body.maths,
//                     computerScience: req.body.computerScience
//                 });

//                 studentMark.save(err => {
//                     if (err) {
//                         res.send(err);
//                     }
//                 });


//                 Mark.findOne({ student_id: req.params.studentId })
//                     .exec((err, marks) => {

//                         if (err) {
//                             res.send(err);
//                         }

//                         console.log(marks);

//                         Student.findOne({ _id: req.params.studentId }, (err, student) => {
//                             if (err) {
//                                 res.send(err);
//                             }

//                             student.studentMarks.push(marks._id);
//                             student.save();
//                             res.send(student);
//                         });
//                     });

//             }
//         })
//         .catch(err => {
//             res.send(err);
//         });
// })



app.listen(3000, () => console.log("Server is running on port 3000..."));
