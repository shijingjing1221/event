
var mongoose = require('mongoose')
  , http = require('http');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {title: 'Microstrategy English Class'});
};

exports.createSession = function(req, res) {
  var access_token = req.body['access_token'];
  if(!access_token) return res.send(400, {message: 'You have to provide your access token!'});

  var url = "http://account.36node.com:3000/api/users/me?access_token=" + access_token;
  http.get(url, function(response) {
  	console.log("Got response from oauth server: " + response.statusCode);
    response.setEncoding('utf8');

    var data = '';
    response.on('data', function (chunk) {
      data+=chunk;
    });

    response.on('end', function(){
  		req.session.data = user;
  		req.session.auth = true;
  		req.session.last_login_time = new Date();
  		res.cookie('access_token', access_token, {path: '/',maxAge: 1000*60*60*24*30}); //cookie 有效期30天
      res.send(req.session);
      console.log('user: ' + req.session.user.name + ' login successfully!');
    });
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
    res.send(500, {message: 'Server inner problem with oAuth!'});
	});
};

exports.deleteSession = function(req, res) {
  if(!req.session.user) return res.send(400,{message: 'You have not login'});
  console.log('delete session of user:' + req.session.user.name );
  req.session.destroy();
  res.clearCookie('auth_token', { path: '/' });
  res.send({message: 'success'});
};