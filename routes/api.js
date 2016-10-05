var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Stock = mongoose.model('Stock');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

router.route('/stock/:name')
    .put(function(req, res) {
        Stock.findOne({
            'stock_name': req.params.name
        }, function(err, stock) {
            if (err) {
                return res.send(500, err);
            }

            stock.data = req.body.data;

            stock.save(function(err, stock) {
                if (err) res.send(err);
                res.json(stock);
            });

        });
    });

router.route('/stock/')
    .post(function(req, res) {
        var stock = new Stock();
        stock.stock_name = req.body.stock_name;
        stock.data = req.body.data;

        stock.save(function(err, stock) {
            if (err) {
                return res.send(500, err);
            }
            //SOCKET
            io.emit('stock', req.body);
            return res.json(stock);
        });
    })
    .get(function(req, res) {
        Stock.find({
        }, function(err, stock) {
            if (err) {
                return res.send(500, err);
            }
            return res.send(stock);
        });
    });

module.exports = router;