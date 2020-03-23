
'use strict';

const encivInfo = require('./enciv-info');
const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;

global.args = {
    year: "2020",  // the year to take race data from
    diff: true // use "" in the command line for false, if you set this to anything it will show shallow differences when errors are detected
};

async function main() {
    try {
        await encivInfo.init(args.year + '-01-01');
        console.info("encivInfo.init complete",Object.keys(encivInfo.viewers).length,Object.keys(encivInfo.participants).length,Object.keys(encivInfo.recorders).length);

        // the code to do the social media preview image should go in here 
        //set env variable,CC_host='https://undebate-stage1.herokuapp.com'. replace it with real host;
        var site = process.env.CC_HOST + '/schoolboard-conversation';
        console.log("site=" +site);
        var d = new Date();
        var image_fname = 'site_preview_'+ d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() +'.png';
        await undebate_site_preview(site, image_fname);
        //unload to Cloudnary
        cloudinary.uploader.upload(image_fname, { tags: 'undebate' }, function (err, image) {
            console.log();
            console.log("** File Upload to Cloudinary");
            if (err) { console.warn(err); }
            console.log("* " + image.url);
         });
        //Update image.url into Iota for social media preview (under the design) 
        await encivInfo.disconnect();
    }
    catch(err){
        console.error(err);
    }
}
 async function undebate_site_preview(site, image_fname) {
    console.log('Generate preview image for site: '+site+' image_file_name: '+image_fname);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
        width: 1200,
        height: 900,
        deviceScaleFactor: 1,
    });
    await page.goto(site);
    await page.screenshot({path: image_fname});
    await browser.close();
}

main();