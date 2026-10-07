const express = require('express');
const { getSettings } = require('../controllers/settingController');

const router = express.Router();

router.get('/', getSettings);

module.exports = router;
