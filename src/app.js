require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const { default: helmet } = require('helmet')
const compression = require('compression')

const app = express()

// init middleware

app.use(express.json())
app.use(
    express.urlencoded({
        extended: true,
    })
)

app.use(morgan('dev'))
app.use(helmet())
app.use(compression())

//init db

require('./dbs/init.mongodb')

// redis
const { initRedis } = require('./dbs/init.redis')
initRedis()

//ioRedis
const ioRedis = require('./dbs/init.ioredis')

ioRedis.init({ IOREDIS_IS_ENABLED: true })

//init router

app.use('/', require('./routes'))

// require('./test/inventory.test')
// const productTest = require('./test/product.test')
// productTest.purchaseProduct('001', 2)

//handling error

app.use((req, res, next) => {
    const error = new Error('Not found!')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error',
        // stack: error.stack,
    })
})

module.exports = app
