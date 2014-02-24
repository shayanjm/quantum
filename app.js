
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();
var server = app.listen(process.env.PORT || 3000);
var io = require('socket.io').listen(server);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/app');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'app')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

// 15, increment by [1,2] on visit
// kArray[Math.floor((Math.random()*15)+1)] += Math.random() * 2;
var kArray = [15.1, 15.1, 15.1, 15.1, 15.1, 15.1, 15.1, 15.1, 15.1, 15.1, 15.1, 15.1, 15.1, 15.1, 15.1, 15.1];

// Probably (0, 15)
// drateArray[Math.floor((Math.random()*15)+1)] = Math.random() * 15;
var drateArray = [20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0];

// 20-100 consistently
// modArray[Math.floor((Math.random()*15)+1)] = (Math.random() * (80))+20;
var modArray = [50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0];

io.sockets.on('connection', function (socket) {
    // Random functionality here
    drateArray[Math.floor((Math.random()*15)+1)] = Math.random() * 15;
    kArray[Math.floor((Math.random()*15)+1)] += Math.random() * 2;
    modArray[Math.floor((Math.random()*15)+1)] = (Math.random() * (80))+20;
    var data = { 'kArray': kArray, 'drateArray': drateArray, 'modArray': modArray };

    // Push out to all clients
    io.sockets.emit('currentData', data);
    socket.on('getInitData', function () {
        console.log('sending data');
        socket.emit('currentData', data);
    });
});
