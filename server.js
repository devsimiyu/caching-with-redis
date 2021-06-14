const express = require('express')
const redis = require('redis')
const responseTime = require('response-time')
const app = express()
const port = process.env.PORT || 3000
const axios = require('axios')

app.use(responseTime())

app.get('/rockets', async function(req, res, next) {
    try {
        let response = await axios.get('https://api.spacexdata.com/v3/rockets')
        let rockets = response.data
        res.status(response.status).send(rockets)
    } 
    catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
})

app.listen(port, () => console.log('server running on port ' + port))