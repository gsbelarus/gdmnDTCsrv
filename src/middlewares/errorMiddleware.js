'use strict'

import http from 'http'

export const JSON = 1
export const HTML = 2

export const UNKNOWN_ERROR_CODE = 1
export const CUSTOM_ERROR_CODE = 2
export const INVALID_ERROR_CODE = 3
export const NOT_FOUND_ERROR_CODE = 4
export const ACCESS_DENIED_ERROR_CODE = 5

export function getErrorMiddleware () {
  return (err, req, res, next) => {
    if (!(err instanceof HttpError)) {
      err = new HttpError(HTML, 500, err)
      console.log(err)
    }
    if (!(err.cause instanceof CodeError)) {
      let nErr = new CodeError(UNKNOWN_ERROR_CODE, 'Unknown error')
      nErr.stack = err.cause.stack
      err.cause = nErr
    }

    res.status(err.code)
    res.statusMessage = err.message

    if (process.env.NODE_ENV) {
      delete err.cause.stack
    }
    switch (err.responseFormat) {
      case JSON: {
        return res.send({
          errorCode: err.cause.code,
          errorMessage: err.cause.message,
          ...err.cause.data,
          stack: err.cause.stack
        })
      }
      case HTML:
      default: {
        return res.render('error', {
          status: err.code,
          statusMessage: err.message,
          error: err.cause
        })
      }
    }
  }
}

class ExtendableError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }
  }
}

export class CodeError extends ExtendableError {
  constructor (code, message, data) {
    super(message)
    this.code = code
    this.message = message
    this.data = data
  }
}

export class HttpError extends CodeError {
  constructor (responseFormat, code, cause, data) {
    super(code, http.STATUS_CODES[code] || http.STATUS_CODES[500], data)
    this.responseFormat = responseFormat
    this.cause = cause
  }
}