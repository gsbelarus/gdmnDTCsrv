'use strict'

import express from 'express'
import { CodeError, HttpError, JSON, NOT_FOUND_ERROR_CODE } from '../middlewares/errorMiddleware'
import apiV1 from './v1/api'

let router = express.Router()

router.use('/v1', apiV1)

router.use('/*', (req, res, next) => {
  next(new HttpError(JSON, 501, new CodeError(NOT_FOUND_ERROR_CODE, 'Not implemented yet')))
})

export default router