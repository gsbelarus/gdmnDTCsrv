'use strict'

import config from 'config'
import http from 'http'
import https from 'https'
import path from 'path'
import fs from 'fs'
import app from './app'

if (config.get('server.http.enabled')) {
  let server = http.createServer(app)
  server.listen(config.get('server.http.port'), config.get('server.http.host'))

  server.on('error', errorHandler)
  server.on('listening', () => {
    console.log(`Listening on http://${server.address().address}:${server.address().port}; env: ${app.get('env')}`)
  })
}

if (config.get('server.https.enabled')) {
  let key = fs.readFileSync(path.resolve(process.cwd(), config.get('server.https.keyPath')))
  let cert = fs.readFileSync(path.resolve(process.cwd(), config.get('server.https.certPath')))

  let server = https.createServer({key, cert}, app)
  server.listen(config.get('server.https.port'), config.get('server.https.host'))

  server.on('error', errorHandler)
  server.on('listening', () => {
    console.log(`Listening on https://${server.address().address}:${server.address().port}; env: ${app.get('env')}`)
  })
}

function errorHandler (error) {
  if (error.syscall !== 'listen') {
    throw error
  }
  switch (error.code) {
    case 'EACCES':
      console.error('Port requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error('Port is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}