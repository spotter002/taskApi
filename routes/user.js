const express = require('express');
const router = express.Router();
const { User } = require('../models/model');
const bcrypt = require('bcryptjs');
// get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
// get user by id
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}); 
// update user 
router.put('/', async (req, res) => {
    try {
        const { name, email, password, currentEmail, photo } = req.body;

        // Validate required fields
        if (!currentEmail) {
            return res.status(400).json({ message: 'Current email is required' });
        }

        // Find the user by their current email
        const user = await User.findOne({ email: currentEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }zander

        // Check if the new email is already in use (if email is being updated)
        if (email && email !== currentEmail) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Prepare update data
        let updateData = { name, email: email || currentEmail }; // Use new email if provided, else keep current

        // Handle password update if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateData.password = hashedPassword;
        }

        // Update the user
        const updatedUser = await User.findOneAndUpdate(
            { email: currentEmail }, // Find by current email
            { $set: updateData },   // Update with new data
            { new: true, runValidators: true } // Return updated document, run schema validators
        );

        

        // Respond with the updated user
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// delete user
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
// export the router
module.exports = router;    