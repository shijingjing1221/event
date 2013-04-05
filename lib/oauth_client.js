var http = require('http')
	, querystring = require('querystring')
	, serializer = require('serializer')
  , config = require('../config');

var crptSerializer = serializer.createSecureSerializer('crypt_key', 'sign_key');

exports.auth = function(req,res,next){
	res.locals.session = req.session;
  if(req.session.auth) return next();

  if(req.cookies['auth_token']){
  	console.log('auth through cookie!');
  	var data;
  	try{
  		data = crptSerializer.parse(req.cookies['auth_token']);
			var url = 'http://account.36node.com:3000/api/users/me?access_token=' + data[0];
		  http.get(url, function(response){
		    console.log("Got response from oauth server: " + response.statusCode);
		    if(response.statusCode != 200) return next();

		    var data = '';
		    response.setEncoding('utf8');
		    response.on('data', function (chunk) {
		      data += chunk;
		    });

		    response.on('end', function(){
		      req.session.user = eval('('+data+')');
		      req.session.auth = true;
		      req.session.last_login_time = new Date();
		      console.log('user: ' + req.session.user.name + ' login successfully!');
		      next();
		    });

		  }).on('error', function(e){
		    console.log('[createSessionFromAuthServer]: problem with request: ' + e.message);
		  });
  	}catch(e){
  		res.clearCookie('auth_token', { path: '/' });
  		console.log('[oauth client]: access token is wrong, clear it!');
  	}
  }else if(req.query['code']){
  	console.log('auth through access code!');
		var post_data = querystring.stringify({client_id: 1,	client_secret: '1secret',	code: req.query['code']});

  	var options = {
		  hostname: 'account.36node.com',
		  port: 3000,
		  path: '/oauth/access_token',
		  method: 'POST',
  		headers:{
  			'Content-Type':'application/x-www-form-urlencoded',
				'Content-Length':post_data.length
      }
		};

		var post_request = http.request(options, function(response) {
		  console.log('STATUS: ' + response.statusCode);
		  console.log('HEADERS: ' + JSON.stringify(response.headers));
		  response.setEncoding('utf8');
		  response.on('data', function (chunk) {
		    var data = eval('(' + chunk + ')');
		    var atok = crptSerializer.stringify([data.access_token, new Date(), 'identify']);
      	res.cookie('auth_token', atok, {path: '/',maxAge: 1000*60*60*24*30}); //cookie 有效期30天
      	res.redirect(req.path);
		  });
		});

		post_request.on('error', function(e) {
		  console.log('problem with request: ' + e.message);
		});

		post_request.write(post_data);
		post_request.end();
  }else next();

};