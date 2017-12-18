'use strict'

import express from 'express'
import { attach, commit, detach, query, rollback, transaction } from '../../database/dbHelper'

let router = express.Router()

function addDbToRequest (callback) {
  return async (req, res, next) => {
    try {
      req.db = await attach()
      await callback(req, res, next)
    } catch (error) {
      console.log(error)
      next(error)
    } finally {
      if (req.db) {
        try {
          await detach(req.db)
        } catch (error) {
          console.error(error)
        }
        delete req.db
      }
    }
  }
}

router.get('/operations', addDbToRequest(async (req, res, next) => {
  let data = await
    query(req.db, `
      SELECT
        ID                AS "_id",
        USR$NAME          AS "_name",
        USR$CODE          AS "_code",
        USR$SORTNUMBER    AS "_sortNumber",
        USR$DISABLED      AS "_disabled"
      FROM USR$MD_OPERATION
    `)
  data.forEach(item => item._disabled = Boolean(item._disabled))
  res.send(data)
}))

router.get('/storingPlaces', addDbToRequest(async (req, res, next) => {
  let data = await query(req.db, `
      SELECT DISTINCT
        ID                AS "_id",
        USR$NAME          AS "_name",
        USR$CODE          AS "_code",
        USR$DISABLED      AS "_disabled"
      FROM USR$STORINGPLACE
    `)
  data.forEach(item => item._disabled = Boolean(item._disabled))
  res.send(data)
}))

router.get('/operators', addDbToRequest(async (req, res, next) => {
  let data = await query(req.db, `
      SELECT DISTINCT
        B.ID                AS "_id",
        C.NAME              AS "_name",
        B.USR$DISABLED      AS "_disabled"
      FROM USR$MD_OPERATOR B
        LEFT JOIN GD_CONTACT C ON C.ID = B.USR$CONTACTKEY
    `)
  data.forEach(item => item._disabled = Boolean(item._disabled))
  res.send(data)
}))

router.post('/sessions', addDbToRequest(async (req, res, next) => {
  let trans
  try {
    trans = await transaction(req.db)

    const session = req.body
    console.log(session)
    for (let prop in session._codes) {
      const code = session._codes[prop]
      const data = await query(trans, `
        EXECUTE BLOCK (
          codeName              VARCHAR(60) = ?,
          timeDate              TIMESTAMP = ?,
          operationKey          DOUBLE PRECISION = ?,
          operatorKey           DOUBLE PRECISION = ?,
          storingPlaceKey       DOUBLE PRECISION = ?)
        RETURNS (id INTEGER)
        AS
        BEGIN
          INSERT INTO USR$MD_SCANNEDCODES (
            ID,
            USR$BARCODE,
            EDITIONDATE,
            USR$DATETIMESCAN,
            USR$OPERATIONKEY,
            USR$OPERATORKEY,
            USR$PLACE 
          )
          VALUES (
            GEN_ID(GD_G_UNIQUE, 1),
            :codeName,
            'now',
            :timeDate,
            :operationKey,
            :operatorKey,
            :storingPlaceKey
          )
          RETURNING ID INTO :id;
          SUSPEND;
        END
      `, [
        code.name,
        session._time,
        session._operation._id,
        session._operator._id,
        code._storingPlace.id
      ])
      if (!data[0]) throw new Error('Not created')
    }

    await commit(trans)
    res.status(200)
    res.send({ok: true})
  } catch (error) {
    if (trans) {
      await rollback(trans)
    }
    next(error)
  }
}))

export default router