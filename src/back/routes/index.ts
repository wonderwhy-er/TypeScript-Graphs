/// <reference path='../../../typings/main.d.ts' />
import express = require('express');

var router = express.Router();

router.get('/couplings', function (req, res, next) {
    res.render('couplings', {
        title: 'Typescript Project Couplings Viewer'
    });
});

export = router;