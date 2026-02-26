const SOSAlert = require("../models/SOSAlert");

exports.createSOS = async (req, res) => {
  try {
    const { studentId, latitude, longitude } = req.body;

    const alert = await SOSAlert.create({
      studentId,
      latitude,
      longitude,
    });

    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getAllSOS = async (req, res) => {
  try {
    const alerts = await SOSAlert.find().sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
