require('dotenv').config()

const express = require('express')
const bcrypt = require('bcrypt')
const cors = require('cors')
const fs = require('fs/promises')

const app = express()
app.use(express.json())
app.use(
    cors({
      origin: "*",
    })
  )

const db = require('./db.js')
const jwt = require('jsonwebtoken')

// users = [{username: 'superduck'}]
// app.get('/', (req, res) => {
//     res.json(users)
// })

app.post('/user/signup', checkEandU , async (req, res) => {
    console.log(req.body.username, ' ', req.body.email)
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        await db.addUser(req.body.username, req.body.email, hashedPassword)
    } catch {
        res.json({status: 'bcrypt error'})
    }

    let username = req.body.username

    await fs.writeFile('./userScripts' + username, "", err => {
        console.log(err)
        res.json({status: 'create file error'})
    })
    res.json({status: 'success'})
})

app.post('/user/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.send({status: "noRefreshToken"})
    if (!db.checkRefreshToken(refreshToken)) return res.send({status: "wrongRefreshToken"})
    jwt.verify(refreshToken, process.env.RERESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.send({status: "errorInVerifyRefreshToken"})
        const accessToken = jwt.sign({email: user.email, username: user.username}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s'})
        res.send({accessToken : accessToken})
    })
})

app.post('/user/login', async (req, res) => {
    let {hashedPassword, username} = await db.getEmailPU(req.body.email)
    if (username == '') {
        res.json({status: 'noSuchEmail'})
    } else if (await bcrypt.compare(req.body.password, hashedPassword)){
        const userinfo = {email: req.body.email, username: username}
        const accessToken = jwt.sign(userinfo, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' })
        const refreshToken = jwt.sign(userinfo, process.env.RERESH_TOKEN_SECRET)
        db.addRefreshToken(refreshToken)
        res.json({status: 'loggedIN', accessToken: accessToken, refreshToken: refreshToken})
    } else {
        res.json({status: 'wrongPassword'})
    }
})


app.get('/testBotfile', authWithJWT, checkBotFile, async (req, res) => {
    //req.body.botfile will be how I send the botfile
    //first I will check the botfile in the checkBotFile function
    //possibly I will make another middleware after checkbot to test the file

    await fs.writeFile('./userScripts' + req.user['username'], req.body.botfile, err => {
        console.log(err)
        res.json({status: "error in writing file"})
    })
    res.send({userinfo: req.user})
})



function authWithJWT(req, res, next) {
    const authHeader = req.headers['authorization']
    // const token = authHeader && authHeader.split(' ')[1]
    const token = authHeader
    if(token == null) return res.send({status: "noToken"})

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.send({status: 'incorrectToken'})
        console.log(user)
        req.user = user
        next()
    })
}

async function checkEandU(req, res, next) {
    if (! /^[a-zA-Z0-9]*$/.test(req.body.username)){ 
        res.json({status: 'username'})
        return
    }
    else if (! /[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(req.body.email)){
        res.json({status: 'email'})
        return
    }
    db.checkUserAndEmail(req.body.username, req.body.email)
    .then(check => {
        console.log('check: ', check)
        if (check == 'success') next();
        else res.json({status: check})
    })
    .catch(err => console.log("index checkUnique ", err))
}

async function checkBotFile(req, res, next) {
    if(req.body.botfile.indexOf('require') != -1){
        res.json({status: 'botfile contains require'})
    }
    next()
}




const port = process.env.PORT || 4000
app.listen(port)