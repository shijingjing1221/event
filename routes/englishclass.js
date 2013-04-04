var Class = require('../models/class.js')
	, mongoose = require('mongoose');


/**
 * API
 */

exports.getClasses = function(req, res){
	console.log('api get classes ...');
	var query = {};
	if(req.query.start) query.start = {$gte: new Date(req.query.start)};
	if(req.query.end) query.end = {$lte: new Date(req.query.end)};

	Class.find(query, function(err, classes) {
		if(err) return res.send(500, {message: 'get classes from mongodb with error'});
		res.send(classes);
	});
};

exports.getClass = function(req, res){
	console.log('api get classes/:id');
	var id = req.params.id;
	Class.findById(id, function(err, glass){
		if(err) return res.send(500, {message: 'get class from mongodb with error'});
		if(!glass) return res.send(404, {message: 'Can not find class with id: ' + id});

		res.send(glass);
	});
};

exports.deleteClass = function(req, res){
	if(!req.session.user) return res.send(400, {message: 'You are not allowed to delete this class'});
	var id = req.params.id;
	var user = req.session.user;

	Class.findById(id, function(err, glass){
		if(!glass) return res.send(404, {message: 'Can not find class with id: ' + id});
		if(user.name != glass.teacher) res.send(400, {message: 'You are not allowed to delete this class'});

		glass.remove(function(err, glass){
			if(err) return res.send(500, {message: 'remove class in mongodb with error'});
			res.send({success: true});
		});
	});
};

exports.createClass = function(req, res){
	var user = req.session.user;
	if(!user) return res.send(400, {message: 'You are not allowed to create this class'});

	var glass = new Class(req.body);
	glass.teacher = user.name;

	glass.save(function(err, glass){
		if(err) return res.send(500, {message: 'Create class in mongodb with error'});
		res.send(glass);
	});
};

exports.updateClass = function(req, res){
	if(!req.session.user) return res.send(400, {message: 'You are not allowed to update this class'});
	var id = req.params.id;

	Class.findById(id, function(err, glass){
		if(err) return res.send(500, {message: 'Get Class from mongodb with error'});
		if(!glass) return res.send(404, {message: 'Can not find class with id:' + id});

		if(req.body.action == "joinOrLeaveClass"){
			// check the time
			var now = new Date();
			if( (now.getTime() - glass.start.getTime()) > 0 ) 
				return res.send(404, {message: 'You can not join or leave closed class!'});

			if(isInClass(req.session.user._id, glass)){
				console.log('leave class');
				removeStudent(req.session.user._id, glass);
			} else {
				if(glass.students.length >= 4) return res.send(404, {message: 'This class is full!'});
				console.log('join class');
				glass.students.push({userId: req.session.user._id, name: req.session.user.name});
			}
		}

		if(req.body.open) glass.open = req.body.open;
		if(req.body.title) glass.title = req.body.title;

		glass.save(function(err, glass){
			if(err) return res.send(500, {message: 'Update class in mongodb with error'});
			res.send(glass);
		});
	});
};

function isInClass(userId, glass){
	var remove = false;
	glass.students.forEach(function(student){
    if(student.userId == userId)
        remove = true;
	});

  return remove;
}

function removeStudent(userId, glass){
  var temp = [];
  glass.students.forEach(function(student){
  	if(userId != student.userId) temp.push(student);
  });

  glass.students = temp;
}