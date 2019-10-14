const Koa = require('koa');
const superagent = require('superagent')
const cheerio = require('cheerio')

const app = new Koa();
app.use(async ctx => {
  let items = [];
  try{
    const resp = await superagent.get('https://cnodejs.org/')
    let $ = cheerio.load(resp.text);
    $('#topic_list .topic_title').each(function (idx, element) {
      let $element = $(element);
      items.push({
        title: $element.attr('title'),
        href: $element.attr('href')
      });
    });
    ctx.body = items;
  }catch (err){
    console.log(err)
  }
})

app.listen(process.env.PORT || 5000);
