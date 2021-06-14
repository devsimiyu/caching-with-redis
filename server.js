require('dotenv').config()

const express = require('express')
const redis = require('redis')
const responseTime = require('response-time')
const axios = require('axios')
const { promisify } = require('util')
const app = express()
const port = process.env.PORT || 3000
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
})
const redisSet = promisify(redisClient.set).bind(redisClient)
const redisGet = promisify(redisClient.get).bind(redisClient)

redisClient.on('error', console.error)

app.use(responseTime())

async function cache(req, res, next) {
    try {
        let rockets = await redisGet('rockets')
        if (rockets == null)
            next()
        else {
            console.log('read from cache')
            res.status(200).send(JSON.parse(rockets))
        }
    }
    catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
}

function api(req, res) {
    axios.get('https://api.spacexdata.com/v3/rockets').then(response => {
        let rockets = response.data
        redisSet('rockets', JSON.stringify(rockets)).catch(console.error)
        console.log('read from api')
        res.status(response.status).send(rockets)
    })
    .catch(error => {
        console.error(error)
        res.status(500).send(error)
    })
}

app.get('/rockets', cache, api)

app.listen(port, () => console.log('server running on port ' + port))