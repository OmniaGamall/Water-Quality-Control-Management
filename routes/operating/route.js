const app = require('express').Router();
const path = require('path');

const operatingController = require(path.join(path.resolve(), "controller/operating.js"))

app.post('/addOperating', operatingController.addOperating);
app.get('/getAllOperatingTechs', operatingController.getAllOperatingTechs)
app.get('/getOperatingTechnicianByID/:OTechID', operatingController.getOperatingTechnicianByID);
module.exports = app;
