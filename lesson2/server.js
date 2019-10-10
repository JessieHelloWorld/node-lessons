const Koa = require('koa');
const utility = require('utility')
const app = new Koa();

// response
app.use(ctx => {
  ctx.body = 'Hello Koa';
  let q = ctx.query.q
  let md5Value = utility.md5(q);
  let sha1Value = utility.sha1(q)
  ctx.body = `md5Value: ${md5Value}; sha1Value: ${sha1Value}`
});

app.listen(3000);