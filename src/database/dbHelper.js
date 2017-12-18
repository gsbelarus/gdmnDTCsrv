'use strict'

import config from 'config'
import firebird from 'node-firebird'
import path from 'path'

export let ISOLATION_READ_UNCOMMITTED = firebird.ISOLATION_READ_UNCOMMITTED
export let ISOLATION_READ_COMMITED = firebird.ISOLATION_READ_COMMITED
export let ISOLATION_READ_COMMITED_READ_ONLY = firebird.ISOLATION_READ_COMMITED_READ_ONLY
export let ISOLATION_REPEATABLE_READ = firebird.ISOLATION_REPEATABLE_READ
export let ISOLATION_SERIALIZABLE = firebird.ISOLATION_SERIALIZABLE

export const options = {
  host: config.get('db.host'),
  port: config.get('db.port'),
  user: config.get('db.user'),
  password: config.get('db.password'),
  database: path.resolve(process.cwd(), config.get('db.path'))
}

export function escape (value) {
  return firebird.escape(value)
}

export function formatDate (date) {
  if (typeof(date) === 'string') {
    date = new Date(date)
  }
  if (!(date instanceof Date)) throw new Error('unsupported type')

  return '\'' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + '\''
}

export function formatDateTime (date) {
  if (typeof(date) === 'string') {
    date = new Date(date)
  }
  if (!(date instanceof Date)) throw new Error('unsupported type')

  return '\'' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' ' +
    date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '.' + date.getMilliseconds() + '\''
}

export async function attachOrCreate () {
  return new Promise((resolve, reject) => {
    firebird.attachOrCreate(options, (err, db) => {
      err ? reject(err) : resolve(db)
    })
  })
}

export async function attach () {
  return new Promise((resolve, reject) => {
    firebird.attach(options, (err, db) => {
      err ? reject(err) : resolve(db)
    })
  })
}

export async function create () {
  return new Promise((resolve, reject) => {
    firebird.create(options, (err, db) => {
      err ? reject(err) : resolve(db)
    })
  })
}

export async function detach (db, force) {
  return new Promise((resolve, reject) => {
    db.detach((err) => {
      err ? reject(err) : resolve()
    }, force)
  })
}

export async function query (db, query, params) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      err ? reject(err) : resolve(result)
    })
  })
}

export async function execute (db, query, params) {
  return new Promise((resolve, reject) => {
    db.execute(query, params, (err, result) => {
      err ? reject(err) : resolve(result)
    })
  })
}

export async function readBlob (blobFieldResult) {
  return new Promise((resolve, reject) => {
    blobFieldResult((err, name, event) => {
      if (err) return reject(err)

      let chunks = [], length = 0
      event.on('data', (chunk) => {
        chunks.push(chunk)
        length += chunk.length
      })
      event.on('end', () => {
        resolve(Buffer.concat(chunks, length))
      })
    })
  })
}

export async function transaction (db, isolation) {
  return new Promise((resolve, reject) => {
    db.transaction(isolation, (err, transaction) => {
      err ? reject(err) : resolve(transaction)
    })
  })
}

export async function commit (transaction) {
  return new Promise((resolve, reject) => {
    transaction.commit((err) => {
      err ? reject(err) : resolve()
    })
  })
}

export async function rollback (transaction) {
  return new Promise((resolve, reject) => {
    transaction.rollback((err) => {
      err ? reject(err) : resolve()
    })
  })
}