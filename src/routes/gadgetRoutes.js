const express = require('express');
const { getAllGadgets, createGadget, deleteGadget, updateGadget, getGadgetById, bulkDeleteGadgets, bulkUpdateGadgets} = require('../controllers/gadgetController');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateJWT, getAllGadgets);
router.post('/', authenticateJWT, createGadget);
router.delete('/:id', authenticateJWT, deleteGadget);

router.put('/bulk-update', authenticateJWT, bulkUpdateGadgets);
router.put('/:id', authenticateJWT, updateGadget);
router.get('/:id', authenticateJWT, getGadgetById);

router.post('/bulk-delete', authenticateJWT, bulkDeleteGadgets);

module.exports = router;