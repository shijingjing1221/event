var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Student = new Schema({
	userId: Schema.ObjectId,
	name: String
});

var ClassSchema = new Schema({
	start: Date,
	end: Date,
	open: {type:Boolean, default:true},
	title: String,
	description: String,
	teacher: String,
	students: [Student]
});

module.exports = mongoose.model('Class', ClassSchema);