var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var models = require('./models/models.js');

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//connect to mongodb
mongoose.connect(process.env.MONGOLAB_URI, function (error) {
    if (error) console.error(error);
    else console.log('mongo connected');
});

//ROUTES
var Stock = mongoose.model('Stock');

app.post('/stock/',function(req, res) {
    var stock = new Stock();
    stock.stock_name = req.body.stock_name;
    stock.data = req.body.data;

    io.emit('stock', stock);

    stock.save(function(err, stock) {
        if (err) {
            return res.send(500, err);
        }

        return res.json(stock);
    });
})
app.get('/stock/',function(req, res) {
    Stock.find({
    }, function(err, stock) {
        if (err) {
            return res.send(500, err);
        }
        return res.send(stock);
    });
});
app.delete('/stock/:name',function(req,res){
    Stock.remove({
        stock_name: req.params.name
    }, function(err) {
        if (err){
            res.send(err);
        }
        io.emit('stock_remove', req.params.name);

        res.json("deleted :"+req.params.name);
    });
});


http.listen(process.env.PORT || 3000, function () {
    'use strict';
});