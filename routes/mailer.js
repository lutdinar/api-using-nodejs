var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

router.post('/sendEmail', function (req, res) {
    var sendTo = req.query.email;

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'lutdinarfadila10@gmail.com',
            pass: 'sayangrani06'
        }
    });

    var mailOptions = {
        from: 'lutdinarfadila10@gmail.com',
        to: sendTo,
        subject: 'Sending email from WS using NodeJS',
        text: 'http://localhost:3003/permintaan-bantuan/all.json'
    };

    var data = {
        'status': 500,
        'message': 'Error sending email'
    };

    var infoEmail = {
        'accepted': '',
        'rejected': '',
        'messageSize': '',
        'envelope': '',
        'response': ''
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            res.json(data);
            console.log(err);
        } else {
            data['status'] = 200;
            data['message'] = 'Email sent to : '+sendTo;
            data['response'] = info;
            res.json(data);
        }
    })
});

module.exports = router;


