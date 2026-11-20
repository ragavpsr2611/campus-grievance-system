const express = require('express');
const Complaint = require('../models/Complaint');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Create - student submits a complaint
router.post('/', verifyToken, async (req, res) => {
  try {
    const { category, description } = req.body;

    const complaint = new Complaint({
      student: req.user.id,
      category,
      description,
    });

    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Read - student's own complaints
router.get('/my', verifyToken, async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Read - admin sees all complaints, with optional status/category filters
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const complaints = await Complaint.find(filter)
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update - admin changes status
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete - owning student or admin
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const isOwner = complaint.student.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await complaint.deleteOne();
    res.status(200).json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
