var http = require('http');

exports.auth = function(req,res,next){
	res.locals.session = req.session;
  
  // 只在用户第一次会话时 检查cookie; 检查过一次就不再检查了
  if(req.session.auth != undefined) return next();
  req.session.auth = false;

  var access_token = req.cookies['access_token'];
  if(!access_token) return next();

  var url = "http://account.36node.com:3000/api/users/me?access_token=" + access_token;
  http.get(url, function(res) {
  	console.log("Got response from oauth server: " + res.statusCode);
		req.session.user = res;
		req.session.auth = true;
		req.session.last_login_time = new Date();
		next();
	}).on('error', function(e) {
	  console.log("Got error: " + e.message);
	  next(e);
	});
}