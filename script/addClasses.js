var Class = require('../models/class.js')
	, mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/event');

var start = new Date();
var end = new Date();

start.setDate(start.getDate()-1);
end.setDate(end.getDate()-1);

for(var i = 0; i < 500; i++){
	// 日期+1
	start.setDate(start.getDate()+1);
	end.setDate(end.getDate()+1);

	// 跳过周六周日
	if(start.getDay() == 0 || start.getDay() == 6){
		continue;
	}

	// first class
	var s1 = new Date(start);
	var e1 = new Date(end);
	s1.setHours(14);
	s1.setMinutes(0);
	e1.setHours(14);
	e1.setMinutes(30);
	
	var glass1 = new Class({
		start: s1,
		end: e1,
		title: 'first class',
		teacher: 'corey'
	});

	glass1.save(function(err){
		if(err) console.log('save failed:' + start);
	});

	// second class
	var s2 = new Date(start);
	var e2 = new Date(end);
	s2.setHours(14);
	s2.setMinutes(30);
	e2.setHours(15);
	e2.setMinutes(0);
	
	var glass2 = new Class({
		start: s2,
		end: e2,
		title: 'second class',
		teacher: 'corey'
	});

	glass2.save(function(err){
		if(err) console.log('save failed:' + start);
	});

	// third class
	var s3 = new Date(start);
	var e3 = new Date(end);
	s3.setHours(15);
	s3.setMinutes(30);
	e3.setHours(16);
	e3.setMinutes(0);
	
	var glass3 = new Class({
		start: s3,
		end: e3,
		title: 'third class',
		teacher: 'corey'
	});

	glass3.save(function(err){
		if(err) console.log('save failed:' + start);
	});

	// fourth class
	var s4 = new Date(start);
	var e4 = new Date(end);
	s4.setHours(16);
	s4.setMinutes(0);
	e4.setHours(16);
	e4.setMinutes(30);
	
	var glass4 = new Class({
		start: s4,
		end: e4,
		title: 'fourth class',
		teacher: 'corey'
	});

	glass4.save(function(err){
		if(err) console.log('save failed:' + start);
	});

	// fifth class
	var s5 = new Date(start);
	var e5 = new Date(end);
	s5.setHours(17);
	s5.setMinutes(0);
	e5.setHours(17);
	e5.setMinutes(30);
	
	var glass5 = new Class({
		start: s5,
		end: e5,
		title: 'fifth class',
		teacher: 'corey'
	});

	glass5.save(function(err){
		if(err) console.log('save failed:' + start);
	});

	// sixth class
	var s6 = new Date(start);
	var e6 = new Date(end);
	s6.setHours(17);
	s6.setMinutes(30);
	e6.setHours(18);
	e6.setMinutes(0);
	
	var glass6 = new Class({
		start: s6,
		end: e6,
		title: 'sixth class',
		teacher: 'corey'
	});

	glass6.save(function(err){
		if(err) console.log('save failed:' + start);
	});
}

console.log('maybe finished, but please wait。。。。');

