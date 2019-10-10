let Koa = require('koa');
var Router = require('koa-router');
const router = new Router();

let app = new Koa();

// 与之前一样
let fibonacci = function (n) {
  // typeof NaN === 'number' 是成立的，所以要判断 NaN
  if (typeof n !== 'number' || isNaN(n)) {
    throw new Error('n should be a Number');
  }
  if (n < 0) {
    throw new Error('n should >= 0')
  }
  if (n > 10) {
    throw new Error('n should <= 10');
  }
  if (n === 0) {
    return 0;
  }
  if (n === 1) {
    return 1;
  }

  return fibonacci(n-1) + fibonacci(n-2);
};
// END 与之前一样

router.get('/fib',(ctx,next) => {
  // http 传来的东西默认都是没有类型的，都是 String，所以我们要手动转换类型
  let n = Number(ctx.query.n)
  try{
    ctx.body = fibonacci(n)

  }catch(e) {
    ctx.response.status = 500;
    ctx.response.body = e.message
  }
});

app
  .use(router.routes())
  .use(router.allowedMethods());

module.exports = app.listen(3000, function () {
  console.log('app is listening at port 3000');
}); // IMPORTANT!! https://stackoverflow.com/questions/33986863/mocha-api-testing-getting-typeerror-app-address-is-not-a-function 
// 'It's important to export the http.Server object returned by app.listen(3000) instead of just the function app, otherwise you will get TypeError: app.address is not a function.'