const express = require('express');
const Section = require('../models/Section');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const sections = await Section.findAll();
    res.json(sections);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
