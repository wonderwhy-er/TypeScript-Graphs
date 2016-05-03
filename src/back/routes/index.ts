/// <reference path='../../../typings/main.d.ts' />
import express = require('express');

var router = express.Router();

router.get('/couplings', function (req, res, next) {
    res.render('couplings', {
        title: 'Typescript Project Couplings Viewer'
    });
});


router.get('/webstorm', function(req,res,next) {
    var childProcess = require('child_process');
    childProcess.exec(`WebStorm.exe ${req.query.path} --line ${req.query.line}`);
    res.send('ok');
});
export = router;