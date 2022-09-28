const {Client} = require('pg')
const axios = require('axios')
require('dotenv').config()

const client = new Client({ connectionString:process.env.PG_STRING })

client.connect()

/* 
api link: https://cloud.iexapis.com/stable/stock/aapl/book?token=
batch api link: https://cloud.iexapis.com/stable/stock/market/batch?types=quote&symbols=aapl,fb,tsla&token=
batch api link is up to 100 at time
price (stock, price, pe, marketcap, w52h, w52l, ytd)
stock: name
price: ("iexRealtimePrice", "latestPrice")
pe: "peRatio"
marketcap: "marketCap"
w52h: "week52High"
w52l: "week52Low"
ytd: "ytdChange"

hourlyprice (stock, h1, h2, h3, h4, h5, h6, h7)
*/

async function superduper(client){
  const firstQuery = await client.query('select * from pastprice limit 1')
  let stocknames = Object.keys(firstQuery.rows[0])
  stocknames.shift()

  for (let i = 0; i < stocknames.length; i+=100){
    const symbols = stocknames.slice(i, i + 100).toString()
    let querystatement = 'insert into price (stock, price, pe, marketcap, w52h, w52l, ytd) values '
    const res = await axios.get(`https://cloud.iexapis.com/stable/stock/market/batch?types=quote&symbols=${symbols}&token=${process.env.IEX_TOKEN}`)
    
    for (const stock in res.data) {
      querystatement += "('" + stock.toLowerCase() + "', " + res.data[stock]["quote"]["latestPrice"] + ', ' + res.data[stock]["quote"]["peRatio"] + ', ' + res.data[stock]["quote"]["marketCap"] + ', ' + res.data[stock]["quote"]["week52High"] + ', ' + res.data[stock]["quote"]["week52Low"] + ', ' + res.data[stock]["quote"]["ytdChange"] + "), "
    }
    
    querystatement += "*"
    querystatement = querystatement.replace(", *", "")
    querystatement += " on conflict(stock) do update set (price, pe, marketcap, w52h, w52l, ytd) = (excluded.price, excluded.pe, excluded.marketcap, excluded.w52h, excluded.w52l, excluded.ytd)"
    
    // console.log('query was done for index ', i, ' to ', i + 100)
    const lastQuery = await client.query(querystatement)
    // console.log(lastQuery)
  }
  
  const prices = await client.query("select stock, price from price")
  let stockprices = {}
  prices.rows.forEach(row => stockprices[row['stock']] = row['price'])

  const hourprice = await client.query("select * from hourlyprice")
  const hours = Object.values(hourprice.rows[0]).filter(item => Number.isInteger(parseInt(item))).length
  
  if(hours == 0 || hours == 7){
    
    nquery = 'insert into hourlyprice(stock, h1) values '

    Object.keys(stockprices).forEach(stock => {
      nquery += "('" + stock + "'," + stockprices[stock] + "), "
    })

    nquery += "*"
    nquery = nquery.replace(", *", "")
    // console.log(nquery)

    await client.query("delete from hourlyprice where 1 = 1")
    await client.query(nquery)
  }
  else if (hours < 7 ){
    let pasthour = {}

    hourprice.rows.forEach(row => {
      let arr = []
      for (let i = 1; i < hours + 1; i ++){
        arr.push(row[`h${i}`])
      }
      arr.push(stockprices[row['stock']])
      pasthour[row['stock']] = arr
    })
    
    nquery = 'insert into hourlyprice(stock, h1'
    for (let i = 2; i < hours + 2; i++ ){
      nquery += `, h${i}`
    }
    nquery += ") values "

    if(Object.keys(pasthour).length < 1) console.log('hourlyprice table is empty')

    Object.keys(pasthour).forEach(stock => {
      nquery += "('" + stock + "'," + pasthour[stock].toString() + "), "
    })

    nquery += "*"
    nquery = nquery.replace(", *", "")
    // console.log(nquery)

    await client.query("delete from hourlyprice where 1 = 1")
    await client.query(nquery)
  }

  client.end()
}

superduper(client).catch(e => console.log('==== Error =====', e))