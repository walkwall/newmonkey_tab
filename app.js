/**
 * Created by kangtian on 16/9/12.
 */

var G = require('./config/global');
var express = require('express');
var logger = require('morgan');

var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var AV = require('leanengine');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/static', express.static('static'));

// debug, show access. after static to not show static.
console.log('IS_DEV: ' + G.is_dev());
if (G.is_dev()) {
    app.use(logger('dev'));
}

app.use(AV.express());

// 加载 cookieSession 以支持 AV.User 的会话状态
app.use(AV.Cloud.CookieSession({secret: '05XgTktKPMkU', maxAge: 3600000, fetchUser: true}));

// 强制使用 https
app.enable('trust proxy');
app.use(AV.Cloud.HttpsRedirect());

app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Routes, 可以将一类的路由单独保存在一个文件中
var users = require('./routes/users');
var monkey = require('./routes/monkey');
var site = require('./routes/site');

app.use('/users', users);
app.use('/monkey', monkey);
app.use('/site', site);


app.get('/', function (req, res) {
    res.redirect('/monkey');
});

// 如果任何路由都没匹配到，则认为 404
// 生成一个异常让后面的 err handler 捕获
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handlers
// 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('base/error', {
            message: err.message || err,
            error: err
        });
    });
}

// 如果是非开发环境，则页面只输出简单的错误信息
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('base/error', {
        message: err.message || err,
        error: {}
    });
});

module.exports = app;
