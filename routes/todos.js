const { auth } = require('./auth');

const express = require('express');

const { auth } = require('../Authorization/auth');
const { Todo } = require('../Model/model'); // ✅ FIXED: import Todo model

const router = express.Router();

// Get all todos for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create todo
router.post('/', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Todo text is required' });
    }

    const todo = new Todo({
      text,
      user: req.user._id
    });

    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update todo
router.put('/:id', auth, async (req, res) => {
  try {
    const { text, completed } = req.body;

    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (text !== undefined) todo.text = text;
    if (completed !== undefined) todo.completed = completed;

    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete todo
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
