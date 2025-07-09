const express = require('express');
const router = express.Router();
const { Employee, Task, User } = require('../models/model');
const auth = require('../middleware/auth');


// Helper to fetch user name from req.user.id
const getUserName = async (userId) => {
  const user = await User.findById(userId).select('name');
  return user?.name || 'Unknown User';
};


// Create a new Employee
router.post('/', auth, async (req, res) => {
    try {
        const { firstName, lastName, email, hireDate, taskId } = req.body;

        if (!email) return res.status(400).json({ message: 'Email is required' });
        if (await Employee.findOne({ email })) {
            return res.status(400).json({ message: 'Employee with this email already exists' });
        }

        let task = null;
        if (taskId && taskId.trim() !== "") {
            task = await Task.findById(taskId);
            if (!task) return res.status(404).json({ message: 'Task not found' });
            if (task.assignedTo) return res.status(400).json({ message: `Task "${task.title}" is already assigned.` });
        }

        const newEmployee = new Employee({
            firstName,
            lastName,
            email,
            hireDate,
            salary: task?.salary,
            taskId: task?._id || null,
            taskTitle: task?.title || null,
            userId: req.user.id,
        });

        const savedEmployee = await newEmployee.save();

        if (task) {
            task.assignedTo = savedEmployee._id;
            await task.save();
        }

        const user = await User.findById(req.user.id).select('name');
        res.status(201).json({
            message: `Employee registered by ${user?.name || 'Unknown'}`,
            savedEmployee,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
// Get all Employees
router.get('/', auth, async (req, res) => {
  try {
    const employees = await Employee.find().populate('taskId', 'title salary ');
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get Employee by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('taskId', 'title salary');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Update Employee
router.put('/:id', auth, async (req, res) => {
  try {
    const { firstName, lastName, email, hireDate, taskId } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    let updates = {};
    let salaryFromTask = employee.salary; // fallback to current salary

    if (taskId) {
      const task = await Task.findById(taskId);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      if (task.assignedTo && task.assignedTo.toString() !== employee._id.toString()) {
        return res.status(400).json({ message: `Task "${task.title}" is already assigned to another employee.` });
      }

      // Unassign previous task if different
      if (employee.taskId && employee.taskId.toString() !== taskId) {
        const prevTask = await Task.findById(employee.taskId);
        if (prevTask) {
          prevTask.assignedTo = null;
          await prevTask.save();
        }
      }

      // Assign new task to employee
      task.assignedTo = employee._id;
      await task.save();

      salaryFromTask = task.salary !== undefined ? task.salary : employee.salary;

      updates.taskId = task._id;
      updates.taskTitle = task.title;
    }

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email;
    if (hireDate) updates.hireDate = hireDate;

    updates.salary = salaryFromTask;
    updates.updatedAt = Date.now();

    const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updatedEmployee) return res.status(404).json({ message: 'Employee not found' });

    const userName = await getUserName(req.user.id);
    res.status(200).json({
      message: `Employee updated by ${userName} at ${new Date().toLocaleString()}`,
      updatedEmployee,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});



// Delete Employee
router.delete('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    if (employee.taskId) {
      const task = await Task.findById(employee.taskId);
      if (task) {
        task.assignedTo = null;
        await task.save();
      }
    }

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// export the router
module.exports = router;