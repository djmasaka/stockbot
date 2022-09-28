const { Client } = require('pg')
require('dotenv').config()


db = {
    checkUserAndEmail: async (username, email) => {
        const client = new Client({ connectionString: process.env.PG_STRING })
        client.connect()
        console.log('== ', username, ' ', email, ' ==')

        try {
            console.log('try statment starts')
            let usernameRes = await client.query(`select userid from userinfo where username='${username}'`)
            if (usernameRes.rows.length > 0) {
                client.end()
                return 'username'
            }

            console.log('first check ends')

            // Do you really need to check emails?
            let emailRes = await client.query(`select userid from userinfo where email='${email}'`)
            if (emailRes.rows.length > 0) {
                client.end()
                return 'email'
            }
        } catch (err) {
            console.log('=== error db checkUserAndEmail === ', err.detail)
        } finally {
            client.end()
        }
        return 'success'
    },
    addUser: async (username, email, password) => {
        const client = new Client({ connectionString: process.env.PG_STRING })
        client.connect()
        try {
            await client.query(`insert into userinfo(username, email, pass) values ('${username}', '${email}', '${password}')`)
        } catch (err) {
            console.log('=== error db addUser === ', err.detail)
        } finally {
            client.end()
        }
    },
    getEmailPU: async (email) => {
        const client = new Client({ connectionString: process.env.PG_STRING })
        client.connect()
        try {
            let passwordRes = await client.query(`select username, pass from userinfo where email='${email}'`)
            if (passwordRes.rows < 1) return {hashedPassword: '', username: ''};
            else {
                await client.query(`update userinfo set llogin='${(new Date).toISOString().slice(0,10)}' where email='${email}'`)
                return {hashedPassword: passwordRes.rows[0]['pass'], username: passwordRes.rows[0]['username']}
            }
        } catch (err) {
            console.log('=== db getemailpu === ', err)
        } finally {
            client.end()
        }
    },
    addRefreshToken: async (token) => {
        const client = new Client({ connectionString: process.env.PG_STRING })
        client.connect()
        try {
            let datenow = new Date()
            await client.query(`insert into refreshtokens(token, created) values ('${token}', '${datenow.toISOString().substring(0,19).replace('T', ' ')}')`)
        } catch(err) {
            console.log('=== db addrefreshtoken === ', err)
        }finally{
            client.end()
        }
    },
    checkRefreshToken: async (token) => {
        const client = new Client({ connectionString: process.env.PG_STRING })
        client.connect()
        try {
            let refreshRes = await client.query(`select created from refreshtokens where token='${token}'`)
            return refreshRes.rows.length > 0
        } catch (err) {
            console.log('=== db checkrefreshtoken === ', err)
        } finally {
            client.end()
        }
    },
    getPortfolio: async (userid) => {
        const client = new Client({ connectionString: process.env.PG_STRING })
        client.connect()
        try {
            let portfolio = await client.query(`select * from portfolio where userid='${userid}'`)
            if (portfolio.rows.length != 1){
                console.log('wrong number of rows')
                return
            }
            filtered = Object.entries(portfolio.rows[0]).filter(([key, value]) => Number.isInteger(parseInt(value)))
            simplified = Object.fromEntries(filtered)
            delete simplified['userid']
            simplified['cash'] = parseFloat(simplified['cash'])
            return simplified
        } catch (err) {
            console.log('=== db getPortfolio ===')
            console.log(err)
        } finally {
            client.end()
        }
    },
    updatePortfolio: async (userid, portfolio) => {
        const client = new Client({ connectionString: process.env.PG_STRING })
        client.connect()
        try {
            await client.query(`delete from portfolio where userid = ${userid}`)
            let stocks = Object.keys(portfolio)
            let amounts = Object.values(portfolio)
            await client.query(`insert into portfolio(userid, ${stocks.toString()}) values (${userid}, ${amounts.toString()})`)
        } catch (err) {
            console.log('=== db updatePortfolio ===')
            console.log(err)
        } finally {
            client.end()
        }
    }
}

module.exports = db

// db.checkUserAndEmail('soupmonsterr', 'ggg@gmi.com')
// .then(res => console.log(res))

// db.addUser('superduck', 'ggg@gmi.com', 'ididididi.idididisfsfsf')

// db.updatePortfolio(15, {'cash':48429.10, 'aapl':39, 'msft':34, 'goog':85})
