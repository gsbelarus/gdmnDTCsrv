'use strict'

import bodyParser from 'body-parser'
import config from 'config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { CodeError, getErrorMiddleware, HTML, HttpError, NOT_FOUND_ERROR_CODE } from './middlewares/errorMiddleware'
import api from './routers/api'

const app = express()

app.set('views', './src/views')
app.set('view engine', 'pug')

app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(config.get('server.publicDir')))
app.use(cookieParser())

if (!process.env.NODE_ENV) app.use(cors())

app.use('/api', api)

app.use((req, res, next) => {
  next(new HttpError(HTML, 404, new CodeError(NOT_FOUND_ERROR_CODE, `${req.originalUrl} not found`)))
})

app.use(getErrorMiddleware())

export default app