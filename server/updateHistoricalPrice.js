const {Client} = require('pg')
const axios = require('axios')
require('dotenv').config()

const client = new Client({ connectionString:process.env.PG_STRING })

client.connect()

async function superduper(client){
  //get list of stocks
  const firstQuery = await client.query('select * from pastprice limit 1')
  let stocknames = Object.keys(firstQuery.rows[0])
  stocknames.shift()

  let aaplrequest = await axios.get(`https://cloud.iexapis.com/stable/stock/aapl/quote?token=${process.env.IEX_TOKEN}`)
  let date = (new Date(aaplrequest.data['lastTradeTime'])).toISOString().slice(0, 10)

  let updatequery = `insert into pastprice (theday,"${stocknames.toString().replace(/,/g, '","')}") values ('${date}',`
  
  //get quote information for all stocks from iexapi
  // let responsestocks = ''
  for (let i = 0; i < stocknames.length; i+=100){
    const symbols = stocknames.slice(i, i + 100).toString()
    const res = await axios.get(`https://cloud.iexapis.com/stable/stock/market/batch?types=quote&symbols=${symbols}&token=${process.env.IEX_TOKEN}`)
    for (const stock in res.data){
      updatequery += `${res.data[stock]["quote"]["latestPrice"]},`
    }
    // responsestocks += Object.keys(res.data).toString().toLowerCase() + ','
  }

  updatequery += "*"
  updatequery = updatequery.replace(",*", ")")
  updatequery += " on conflict(theday) do nothing"
  
  // responsestocks += "*"
  // responsestocks = responsestocks.replace(",*", "")
  // console.log(stocknames.toString())
  // console.log("=========================================================================")
  // console.log(responsestocks)


  //run query to insert new row in pastprice table for this date
  await client.query(updatequery)

  const secondQuery = await client.query(`select madeup.* from 
  (select row_number() over (order by theday desc), pastprice.* from pastprice) as madeup
  where row_number in (1, 2, 3, 4, 5, 6, 10, 15, 22, 43, 65, 130, 250, 500);`)

  let stocknames2 = Object.keys(secondQuery.rows[0])
  stocknames2.splice(0, 2)
  let stockprices = []
  for (let i = 0; i < stocknames2.length; i++){
    stockprices.push(secondQuery.rows.map(row => { return row[stocknames2[i]]}))
  }
  insert = "insert into historicalprice (stock, d1, d2, d3, d4, d5, w1, w2, w3, m1, m2, m3, m6, y1, y2) values "
  insert += "('" + stocknames2[0] + "'," + stockprices[0].toString() + ")"
  for (let i = 1; i < stocknames2.length; i++){
    insert += ",('" + stocknames2[i] + "'," + stockprices[i].toString() + ")"
  }
  insert += " on conflict (stock) do update set d1 = excluded.d1, d2 = excluded.d2, d3 = excluded.d3, d4 = excluded.d4, d5 = excluded.d5, w1 = excluded.w1, w2 = excluded.w2, w3 = excluded.w3, m1 = excluded.m1, m2 = excluded.m2, m3 = excluded.m3, m6 = excluded.m6, y1 = excluded.y1, y2 = excluded.y2"
  await client.query(insert)
  client.end()
}

superduper(client).catch(e => console.log('==== Error =====', e))
