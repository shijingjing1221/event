var http = require('http');

exports.setupEvent = function(user, event, cb) {
	console.log('set up out look event for ' + to + ' : ' + title);
	hPostRequest('setup', user, event, cb);
};

exports.cancelEvent = function(user, event, cb) {
	console.log('Cancel out look event for ' + to + ' : ' + title);
	hPostRequest('cancel', user, event, cb);
};

function hPostRequest(method, user, event, cb){
	var post_data = querystring.stringify({
		from_name: 'Gordon, Corey',
		from_address: 'cgordon@microstrategy.com',
		to_name: user.name,
		to_address: user.email,
		start_time: event.start,
		end_time: event.end,
		subject: event.title,
		description: event.description,
		location: 'Room 1633',
		method: method
	});

	var options = {
		hostname: '10.199.56.226',
		port: 80,
		path: '/index.php/home/reminder',		// service path
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
			return cb(data);
		});
	});

	post_request.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	post_request.write(post_data);
	post_request.end();	
}