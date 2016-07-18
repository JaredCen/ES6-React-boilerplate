var koa = require('koa'),
	router = require('koa-router');

var app = koa();

app.use(function*() {
	this.body = 'Hello world';
})

app.listen(3000);
console.log('listening on port 3000!');