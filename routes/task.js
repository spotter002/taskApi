const express = require('express');
const router = express.Router();
const {Task , Employee } = require('../models/model')
const auth = require('../middleware/auth');

// Create a new Task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, salary } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingTask = await Task.findOne({ title });
    if (existingTask) {
      return res.status(400).json({ message: 'Task already exists' });
    }

    let employee = null;
    if (assignedTo) {
      employee = await Employee.findById(assignedTo);
      if (!employee) {
        return res.status(404).json({ message: 'Assigned Employee not found' });
      }
      if (employee.taskId) {
        return res.status(400).json({ mManhwasessage: 'Employee already assigned a task' });
      }
    }

    const newTask = new Task({
      title,
      description,
      salary,
      assignedTo: assignedTo || null,
      dueDate: dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days default
    });

    const savedTask = await newTask.save();

    // If task assigned to an employee, update the employee record
    if (employee) {
      employee.taskId = savedTask._id;
      employee.taskTitle = savedTask.title;
      employee.salary = savedTask.salary;
      await employee.save();

      // Also mark task.assignedTo as employee._id (already set, but just in case)
      savedTask.assignedTo = employee._id;
      await savedTask.save();
    }

    res.status(201).json(savedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


// Get all Tasks
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedTo', 'firstName lastName email userId');
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// get Task by id
router.get('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('assignedTo', 'firstName lastName email userId');
        if (!task) {'Assigned Employee not found'
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Update Task
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, description, assignedTo, status, dueDate, salary } = req.body;
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Validate assignedTo
        if (assignedTo) {
            const employee = await Employee.findById(assignedTo);
            if (!employee) {
                return res.status(400).json({ message: 'Assigned Employee not found'});
            }
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.assignedTo = assignedTo || task.assignedTo;
        task.status = status || task.status;
        task.dueDate = dueDate || task.dueDate;
        task.salary = salary || task.salary;
        task.updatedAt = Date.now();

        const updatedTask = await task.save();
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// delete task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});


// export the router
module.exports = router;