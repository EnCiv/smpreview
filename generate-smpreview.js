'use strict'

const sIota = require('./smpreview_iota')
const puppeteer = require('puppeteer')
const cloudinary = require('cloudinary').v2

async function generateSMPreview(iota) {
  const parentId = iota.parentId
  console.log('Generating a social preview image for parentId:' + parentId)

  await sIota.connectInit()
  const parent = await sIota.path(parentId)
  await generateSMPreviewForParent(parent, hostname)
  await sIota.disconnect()
}

async function performDbScan(hostname) {
  await sIota.connectInit()

  // Scan DBs to find out events/parentIds which smpreviews need to be created or updated
  const parentIds = await sIota.getParentIdsForSMPreview()
  if (parentIds.length) {
    console.info('got new records:', parentIds.length)

    for await (const pId of parentIds) {
      console.log(
        'Found a need to create or update the social preview image for parentId:' +
          pId.parentId
      )

      const parentId = pId.parentId
      if (parentId.length !== 24) continue // it's not an id, might be 'deleted'

      const parent = await sIota.path(parentId)
      await generateSMPreviewForParent(parent, hostname)
    }
    console.log('updated', parentIds.length, 'items.')
  } else {
    console.info('nothing new this time around.')
  }

  await sIota.disconnect()
}

async function generateSMPreviewForParent(parent, hostname) {
  // create a new image filename and generate social preview image file
  const site = _getSite(hostname, parent)
  const imageFilename = _getImageFilename()
  await _generateSitePreview(site, imageFilename)

  // unload to cloudinary and update smpreview record into iota
  const iUrl = await _unloadToCloudinary(imageFilename)
  await sIota.updateSMPreview(parent, iUrl, site)
}

function _getSite(hostname, parent) {
  const site = hostname.startsWith('localhost')
    ? `http://${hostname}${parent.path}`
    : `https://${hostname}${parent.path}` //debug mode, process.env does not be set in debug

  console.log('site: ' + site)
  return site
}

function _getImageFilename() {
  const d = new Date()
  const imageFilename =
    'site_preview_' +
    d.getFullYear() +
    '-' +
    (d.getMonth() + 1) +
    '-' +
    d.getDate() +
    '.png'
  return imageFilename
}

async function _unloadToCloudinary(imageFilename) {
  let iUrl = ''
  await cloudinary.uploader.upload(
    imageFilename,
    { tags: 'undebate' },
    (err, image) => {
      if (err) {
        console.warn(err)
      }
      iUrl = image.url
      console.log('* File Upload to Cloudinary ' + image.url)
    }
  )
  return iUrl
}

async function _generateSitePreview(site, imageFilename) {
  console.log(
    'Generate preview image for site: ' +
      site +
      ' image_file_name: ' +
      imageFilename
  )

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  const page = await browser.newPage()

  await page.setViewport({
    width: 1200,
    height: 700,
    deviceScaleFactor: 1,
  })
  await page.setUserAgent('undebate social media bot')
  await page.goto(site)
  await page.screenshot({ path: imageFilename })
  await browser.close()
}

module.exports = { generateSMPreview, performDbScan }
