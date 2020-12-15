const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const express = require('express')
const { secret } = require('../../config/secret')

const router = express.Router()

const Users = require('./users-model')

router.post('/register', async (req, res) => {
    try {
        const credentials = req.body
        const hash = bcrypt.hashSync(credentials.password, 10)
        credentials.password = hash

        const newUser = await Users.add(credentials)
        res
            .status(200)
            .json(newUser)
    }
    catch(err) {
        res
            .status(500)
            .json({message: 'Could not register new user.'})
    }
})

router.post('/login', async (req, res) => {
    try {
        const user = await Users.findBy(req.body.username)
        if(user && bcrypt.compareSync(req.body.password, user.password)) {
            const token = makeToken(user)
            res
                .status(200)
                .json({message: `Welcome, ${user.username}`, token})
        }
        else {
            res
                .status(401)
                .json({message: "Wrong password bud."})
        }
    }
    catch(err) {
        res
            .status(500)
            .json({message: 'Could not login.'})
    }
})

router.get('/', restricted, async (req, res) => {
    try {
        const data = await Users.getAll()
        res
            .status(200)
            .json(data)
    }
    catch(err) {
        res
            .status(500)
            .json({message: 'Could not retrieve user database.'})
    }
})

function makeToken(user) {
    // we use a lib called jsonwebtoken
    const payload = {
      subject: user.id,
      username: user.username,
      department: user.department,
    }
    const options = {
      expiresIn: '1800s',
    }
    return jwt.sign(payload, secret, options)
  }

function restricted(req, res, next) {
    const token = req.headers.authorization
    if (!token) {
      res.status(401).json('we wants token')
    } else {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          res.status(401).json('we wants GOOD token: ' + err.message)
        } else {
          req.decodedToken = decoded
          next()
        }
      })
    }
  }

module.exports = router