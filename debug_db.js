const mongoose = require('mongoose');
const Student = require('./models/Student');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        try {
            const count = await Student.countDocuments();
            console.log(`Total Students in DB: ${count}`);

            if (count === 0) {
                console.log('Creating a test student...');
                await Student.create({
                    fullName: "Debug Student",
                    email: "debug@student.com",
                    phone: "1234567890",
                    program: "Nursing",
                    password: "password",
                    admissionStatus: "Pending"
                });
                console.log('Test student created.');
            } else {
                const students = await Student.find({});
                console.log('Existing Students:', students.map(s => ({ name: s.fullName, status: s.admissionStatus })));
            }

        } catch (err) {
            console.error(err);
        } finally {
            mongoose.connection.close();
        }
    })
    .catch(err => console.error(err));
