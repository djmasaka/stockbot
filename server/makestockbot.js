const fs = require('fs')
const db = require('./db.js')

//remember to add update to the persons file to include stockbot.update()

makestockbot = async (userid) => {
    try {
        let text = await fs.readFileSync('stockbotTemplate.txt', 'utf-8')
        let data = await fs.readFileSync('data.json', 'utf-8')
        let portfolio = await db.getPortfolio(userid)
        let ntext = text.replace("'data'", data)
        ntext = ntext.replace("'cash'", portfolio['cash'].toString())
        ntext = ntext.replace("'userid'", userid)
        delete portfolio['cash']
        ntext = ntext.replace("'portfolio'", JSON.stringify(portfolio))
        await fs.writeFileSync('stockbot.js', ntext)
    } catch (err) {
        console.log('=== error in makestockbot.js ===')
        console.log(err)
    }
}

module.exports = makestockbot