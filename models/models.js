var mongoose = require('mongoose');

var stockSchema = new mongoose.Schema({
	stock_name: String,
	created_at: {type: Date, default: Date.now},
	data: []
});


mongoose.model('Stock', stockSchema);