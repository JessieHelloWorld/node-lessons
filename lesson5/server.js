const Koa = require('koa')
const cheerio = require('cheerio')
const superagent = require('superagent')
const url = require('url')
const async = require('async')
const app = new Koa()

app.use(async ctx => {
  let topicUrls = []
  let cnodeUrl = 'https://cnodejs.org/';
  // let contentList = []
  try {
    const resp = await superagent.get(cnodeUrl)
    let $ = cheerio.load(resp.text);
    // 获取首页所有连接
    $('#topic_list .topic_title').each(function (idx, element) {
      let $element = $(element);
      // $element.attr('href') 本来的样子是 /topic/542acd7d5d28233425538b04
      // 我们用 url.resolve 来自动推断出完整 url，变成
      // https://cnodejs.org/topic/542acd7d5d28233425538b04 的形式
      // 具体请看 http://nodejs.org/api/url.html#url_url_resolve_from_to 的示例
      let href = url.resolve(cnodeUrl, $element.attr('href'));
      topicUrls.push(href);
    });
    console.log(topicUrls)
    // ctx.body = topicUrls

  }catch(err) {
    console.log(err)
  }

  let concurrencyCount = 0;
  let fetchUrl = async function (topicUrl, callback) {
    console.log(concurrencyCount)
    concurrencyCount++;
    console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', topicUrl);
    const resp = await superagent.get(topicUrl)
    let $ = cheerio.load(resp.text);
    concurrencyCount--;
    callback(null, {
      title: $('.topic_full_title').text().trim(),
      href: topicUrl,
      comment1: $('.reply_content').eq(0).text().trim(),
    }); // 重要 A callback which is called when all iteratee functions have finished, or an error occurs. Results is an array of the transformed items from the coll. Invoked with (err, results).
  };

  try{
    let content = await async.mapLimit(topicUrls, 5, function (topicUrl, callback) {
      fetchUrl(topicUrl, callback);
    });
    ctx.body = content
  }catch(err){
    console.log(err)
  }
})
app.listen(3000)