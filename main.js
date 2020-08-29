'use strict'

const { socketApiServer } = require('socket-api')
const { generateSMPreview, performDbScan } = require('./generate-smpreview')

if (!process.env.HOSTNAME) {
  console.error(
    'HOSTNAME needed.  On bash use: export HOSTNAME="your-hostname-here" or add it to your .bashrc file'
  )
  process.exit()
}

const APIs = [
  {
    name: 'generate_smpreview',
    func: (iota) => {
      generateSMPreview(iota, process.env.HOSTNAME)
      console.info('generated social preview image')
    },
  },
]

try {
  socketApiServer(APIs, () => performDbScan(process.env.HOSTNAME))
} catch (err) {
  console.log(err)
}
