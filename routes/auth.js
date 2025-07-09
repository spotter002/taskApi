//SIGNIN / SIGNUP
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET
const { User } = require('../models/model');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Set the destination for uploaded files
const fs = require('fs');
const path = require('path');  


// User SIGNUP route
router.post('/signup', upload.single('photo'), async (req, res) => {
    try {
        const { name, email, dob, password } = req.body;
        if (!name || !email || !dob || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/; // At least 8 characters
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        console.log(`Hashed Password: ${hashedPassword}`);

        let photo = null;
        if (req.file) {
           const ext=path.extname(req.file.originalname);
           const newFileName = Date.now() + ext; // Create a unique filename
           const newPath = path.join('uploads',newFileName);
           fs.renameSync(req.file.path, newPath); // Move the file to the new path
           photo = newPath.replace(/\\/g, '/'); // Ensure the path is in the correct format for JSON response   

        }

        // Create new user
        const newUser = new User({
            name,
            email,
            dob,
            password: hashedPassword,
            photo
        });

        const savedUser=await newUser.save();
        res.status(201).json({ message: 'User registered successfully',savedUser });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message:error.message});
    }
})

// SIGNIN routejacob
router.post('/signin',upload.none(), async (req,res) => {
    const {email,password } = req.body

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        

        res.status(200).json({ message: 'Signin successful', token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})

module.exports = router

