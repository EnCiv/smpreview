'use strict'

const { socketAPIServer } = require('socket-api')
const { generateSMPreview, performDbScan } = require('./generate-smpreview')

if (!process.env.HOSTNAME) {
  console.error(
    'HOSTNAME needed.  On bash use: export HOSTNAME="your-hostname-here" or add it to your .bashrc file'
  )
  process.exit()
}

const hostname = process.env.HOSTNAME

var dataIsReady = false
var queued = []

const APIs = [
  {
    name: 'generate_smpreview',
    func: (iota) => {
      async function reply() {
        await generateSMPreview(iota, hostname)
        logger.info('generated social preview image')
      }
      if (!dataIsReady) {
        queued.push(reply)
      } else reply()
    },
  },
]

async function main() {
  try {
    await performDbScan(hostname)
  } catch (err) {
    console.error(err)
  }
  dataIsReady = true
}

try {
  socketAPIServer(APIs)
  main()
} catch (err) {
  console.log(err)
}
