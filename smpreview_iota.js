'use strict'

const Iota = require('iota')()
const MongoModels = require('mongo-models')

var smpreview_iota = { _ids: {} }
var smpreview_subject =
  'Simple preview image for socal network query, facebook, tweet'
var smpreview_description = 'Snapshot png image filelink saved in Cloudinary'

async function path(parentId) {
  var data = []
  return new Promise(async (ok, ko) => {
    try {
      data = await Iota.findOne({ _id: Iota.ObjectID(parentId) })
      return ok(data)
    } catch (error) {
      console.error('sIota.path() caught error', error)
      return ko(error)
    }
  })
}

function init() {
  return new Promise(async (ok, ko) => {
    try {
      await Iota.connectInit()
      return ok()
    } catch (err) {
      ko(err)
    }
  })
}

function disconnect() {
  MongoModels.disconnect()
}

function updateSMPreview(parent, iUrl, site) {
  var data = []
  return new Promise(async (ok, ko) => {
    try {
      // Per the discusion, all socialpreview images are kept. When generating social preview, be sure to select the lastest one.
      // in the future, need one housekeeper to archive all Cloudinary old image and delete DB entries.
      // data=await Iota.findOneAndDelete(
      //         {
      //             $and: [
      //                     {parentId: pId},
      //                     {"component.component": "socialpreview"}
      //                 ]
      //         }
      //     )
      const result = await Iota.insertOne({
        parentId: parent._id.toString(),
        subject: 'Social Media Preview: ' + parent.subject,
        description: `a social media preivew for taken from ${site}`,
        component: { component: 'socialpreview', imgUrl: iUrl },
      })
      if (result && result.length === 1) ok(result[0])
      else {
        const msg = `unexpected number of results received ${results.length}`
        logger.error(msg)
        ko(new Error(msg))
      }
      return ok()
    } catch (err) {
      ko(err)
    }
  })
}

function getParentIdsForSMPreview() {
  var data = []
  return new Promise(async (ok, ko) => {
    try {
      var lastSocialPreviews = await Iota.aggregate([
        { $match: { 'component.component': 'socialpreview' } },
        { $sort: { _id: -1 } },
        { $limit: 1 },
      ])
      if (lastSocialPreviews.length) {
        let lastSocialPreview = lastSocialPreviews[0]._id
        data = await Iota.aggregate([
          {
            $match: {
              'component.component': 'MergeParticipants',
              parentId: { $exists: true },
              _id: { $gt: lastSocialPreview },
            },
          },
          { $sort: { _id: -1 } },
          { $group: { _id: '$userId', latest: { $first: '$$ROOT' } } },
          //      { $limit: maxParticipants },
          { $replaceRoot: { newRoot: '$latest' } },
        ])
      } else {
        data = await Iota.aggregate([
          {
            $match: {
              'component.component': 'MergeParticipants',
              parentId: { $exists: true },
            },
          },
          { $sort: { _id: -1 } },
          { $group: { _id: '$parentId', latest: { $first: '$$ROOT' } } },
          //      { $limit: maxParticipants },
          { $replaceRoot: { newRoot: '$latest' } },
        ])
      }
      return ok(data)
    } catch (err) {
      ko(err)
    }
  })
}

smpreview_iota.connectInit = init
smpreview_iota.disconnect = disconnect
smpreview_iota.path = path
smpreview_iota.updateSMPreview = updateSMPreview
smpreview_iota.getParentIdsForSMPreview = getParentIdsForSMPreview

module.exports = smpreview_iota
