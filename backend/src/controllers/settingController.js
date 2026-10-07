const Setting = require('../models/Setting');

// Public route to get all settings
const getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.findAll();
    // Convert to a key-value object for easy frontend consumption
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    res.json(settingsObj);
  } catch (error) {
    next(error);
  }
};

// Admin route to update multiple settings at once
const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body; // e.g. { hero_title: "New Title", marquee_phrases: "..." }
    
    // Iterate and upsert each key
    for (const [key, value] of Object.entries(updates)) {
      const [setting, created] = await Setting.findOrCreate({
        where: { key },
        defaults: { value }
      });
      if (!created) {
        setting.value = value;
        await setting.save();
      }
    }
    
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
