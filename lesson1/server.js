const Koa = require('koa');
const app = new Koa();

// response
app.use(ctx => {
  ctx.body = 'Hello Koa';
});

app.listen(3000); // 打开 http://localhost:3000/ 显示'Hello Koa'