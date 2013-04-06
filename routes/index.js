
var mongoose = require('mongoose')
  , http = require('http')
  , config = require('../config');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index');
};

exports.createSession = function(req, res) {

};

exports.deleteSession = function(req, res) {
  if(!req.session.user) return res.send(400,{message: 'You have not login'});
  console.log('delete session of user:' + req.session.user.name );
  req.session.destroy();
  res.clearCookie('auth_token', { path: '/' });
  res.send({message: 'success'});
};