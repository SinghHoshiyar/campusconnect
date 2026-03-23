const express = require('express');
const router = express.Router();
const { getResources, createResource, deleteResource } = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getResources);
router.post('/', protect, createResource);
router.delete('/:id', protect, deleteResource);

module.exports = router;
