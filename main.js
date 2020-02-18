
'use strict';

const encivInfo = require('./enciv-info');
const puppeteer = require('puppeteer');

global.args = {
    year: "2020",  // the year to take race data from
    diff: true // use "" in the command line for false, if you set this to anything it will show shallow differences when errors are detected
};

async function main() {
    try {
        await encivInfo.init(args.year + '-01-01');
        console.info("encivInfo.init complete",Object.keys(encivInfo.viewers).length,Object.keys(encivInfo.participants).length,Object.keys(encivInfo.recorders).length);

        // the code to do the social media preview image should go in here 
        // need to find which site to update or to generate new one(todo)
        
        //Create preview image
        var site = 'https://undebate-stage1.herokuapp.com/schoolboard-conversation';
        var d = new Date();
        var image_fname = 'site_preview_'+ d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() +'.png';
        await undebate_site_preview(site, image_fname);

        //Update DB (todo)
        
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