var express = require('express');
var favicon = require('serve-favicon');
var app = express();


var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var jade = require('jade');

var bodyParser = require('body-parser');
var mysql = require('mysql');
var cookieParser = require('cookie-parser');

var env = process.env.PORT || 'development';
var port = 3004;

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '******'
});

connection.query('USE website');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'urlencoded');

    next();
};

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(cookieParser('secret_string'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(allowCrossDomain);
app.set('views', __dirname + '/jadeViews');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.redirect('http://churka.gopagoda.com');
});

app.post('/', function(req, res){

    var id = req.body.id;

    connection.query('SELECT userName FROM users WHERE user_id = ?', id,function(err, result){
        if(req.cookies.username == result[0]['userName']){
        }
        else{
            res.cookie('username', result[0]['userName']);
        }

    });

    connection.query('UPDATE users SET chat_id = 1 WHERE user_id = ?', id);

    connection.query('SELECT userName FROM users WHERE chat_id > ?', 0, function(err, rows){
        if(err){
            console.log('error getting user name from db.');
        }
        else if(rows.length == 0){
            res.send('No such user!');
        }
        res.render('index', { users : JSON.stringify(rows)});
    });
});

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

io.on('connection', function(socket){
    connection.query('SELECT userName FROM users WHERE chat_id > ?', 0, function(err, rows){
        io.emit('user-connected', rows);
    });
});

io.on('connection', function(socket){
    socket.on('user-disconnected', function(cookie){
        connection.query('UPDATE users SET chat_id = 0 WHERE userName = ?', cookie);
        io.emit('person-leave', cookie);
    });
});

http.listen(port, function(){
    console.log('listening on port: ' + port);
});