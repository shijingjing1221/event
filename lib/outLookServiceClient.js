var http = require('http');

exports.setupEvent = function(to, title, content, start, end) {
	console.log('set up out look event for ' + to + ' : ' + title);
	var post_data = querystring.stringify({
		email: to,
	  start: start,
	  end: end
	});

	var options = {
		hostname: 'php server',
		port: 80,
		path: '/outlook',		// service path
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length
		}
	};

	var post_request = http.request(options, function(response) {
		console.log('STATUS: ' + response.statusCode);
		console.log('HEADERS: ' + JSON.stringify(response.headers));
		response.setEncoding('utf8');
		response.on('data', function(chunk) {
			var data = eval('(' + chunk + ')');
			// to do with response data 
		});
	});

	post_request.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	post_request.write(post_data);
	post_request.end();
};

exports.cancelEvent = function(to, eventId) {
	console.log('set up out look event for ' + to + ' : ' + title);
	var post_data = querystring.stringify({
		email: to,
	  eventId: eventId
	});

	var options = {
		hostname: 'php server',
		port: 80,
		path: '/cancelOutLook',		// service path
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length
		}
	};

	var post_request = http.request(options, function(response) {
		console.log('STATUS: ' + response.statusCode);
		console.log('HEADERS: ' + JSON.stringify(response.headers));
		response.setEncoding('utf8');
		response.on('data', function(chunk) {
			var data = eval('(' + chunk + ')');
			// to do with response data 
		});
	});

	post_request.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	post_request.write(post_data);
	post_request.end();
};