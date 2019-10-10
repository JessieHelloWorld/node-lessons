const Koa = require('koa')
const eventproxy = require('eventproxy')
const cheerio = require('cheerio')
const superagent = require('superagent')
const url = require('url')

const app = new Koa()
app.use(async ctx => {
  let topicUrls = []
  let cnodeUrl = 'https://cnodejs.org/';
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

  }catch(err) {
    console.log(err)
  }

  let ep = new eventproxy()
  // 命令 ep 重复监听 topicUrls.length 次（在这里也就是 40 次） `topic_html` 事件再行动
  ep.after('topic_html', 3, (topics) => {
    // topics 是个数组，包含了 40 次 ep.emit('topic_html', pair) 中的那 40 个 pair

    // 开始行动
    let content = topics.map((topicPair) => {
      // 接下来都是 jquery 的用法了
      let topicUrl = topicPair[0];
      let topicHtml = topicPair[1];
      let $ = cheerio.load(topicHtml);
      return ({
        title: $('.topic_full_title').text().trim(),
        href: topicUrl,
        comment1: $('.reply_content').eq(0).text().trim(),
      });
    })

    ctx.body = content
  })
  // 注意，cnodejs.org 网站有并发连接数的限制，所以当请求发送太快的时候会导致返回值为空或报错。建议一次抓取3个主题即可
  for(let i = 0; i < 3; i++){
    let topicUrl = topicUrls[i]
    const result = await superagent.get(topicUrl) 
    ep.emit('topic_html', [topicUrl, result.text]);
    console.log(topicUrl)
  }
  // topicUrls.forEach(async topicUrl => {
  //   try{
  //     const result = await superagent.get(topicUrl) 
  //     ep.emit('topic_html', [topicUrl, result.text]);
  //     console.log(topicUrl)
  //   }catch(err){
  //     console.log(err)
  //   }
  // });
})
app.listen(3000)