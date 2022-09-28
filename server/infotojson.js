const {Client} = require('pg')
const axios = require('axios')
const fs = require('fs')
require('dotenv').config()

const client = new Client({ connectionString:process.env.PG_STRING })

client.connect()

// "stocks", "pastprice['aapl']", "hourlyprice['aapl']", "price['appl']", "marketcap['aapl']", "w52h['aapl']", "w52l['aapl']", "ytd['aapl']"

async function superduper(client){
    let bigmother = {}

    let histprice = {}
    let histprices = await client.query('select * from historicalprice')
    histprices.rows.forEach(row => {
        histprice[row['stock']] = Object.values(row).filter(item => Number.isInteger(parseInt(item)))
    })
    bigmother['pastprice'] = histprice
    bigmother['stocks'] = Object.keys(bigmother.pastprice)

    let price = {}
    let prices = await client.query('select * from price')
    prices.rows.forEach(row => {
        const {['stock']: stock, ... rowWithoutStock} = row
        price[stock] = rowWithoutStock
    })
    bigmother['price'] = price

    let hourlyprice = {}
    let hourlyprices = await client.query('select * from hourlyprice')
    hourlyprices.rows.forEach(row => {
        hourlyprice[row['stock']] = Object.values(row).filter(item => Number.isInteger(parseInt(item)))
    })
    bigmother['hourlyprice'] = hourlyprice
    console.log('hourlyprice["aapl] ', bigmother.hourlyprice['aapl'])

    fs.writeFile("data.json",JSON.stringify(bigmother), err => console.log(err))

    client.end()
}

superduper(client).catch(e => console.log('==== Error =====', e))
