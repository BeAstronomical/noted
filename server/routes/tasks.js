const router = require("express").Router();
const Task = require("../models/Task");

// GET TASKS: Fetch tasks for a specific user (sorted by closest due date first)
router.get("/:userId", async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.params.userId }).sort({
      dueDate: 1,
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks." });
  }
});

// CREATE TASK: Add a new task
router.post('/', async (req, res) => {
    try {
        const { userId, title, category, dueDate, extraDetails } = req.body;

        const newTask = new Task({
            userId,
            title,
            category,
            dueDate: dueDate || null,         // If no date was picked, save as null
            extraDetails: extraDetails || ''  // Default to empty string if blank
        });

        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create task.' });
    }
});

// DELETE TASK: Remove a task by its ID
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task." });
  }
});

module.exports = router;
