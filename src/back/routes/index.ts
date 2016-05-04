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
    var command = `"C:\\tools\\WebStorm 2016.1.1\\bin\\WebStorm.exe" --line ${Number(req.query.line)+1} ${req.query.path}`;
    console.log(command);
    childProcess.exec(command);
    res.send('ok');
});
export = router;