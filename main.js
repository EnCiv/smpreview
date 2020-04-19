
'use strict';

const sIota = require('./smpreview_iota');
const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;


async function main() {
    try {
        //while(1) //forever to wait for event from Enciv
        {
            //Receive the event for Event from EnCiv, 
            // (todo) Wait_Event_from_Enciv();
            var parentId = '5d6350b0e7179a084ef376b9';

            //Process the Event to create Smpreview.
            await sIota.connectInit();
            console.log("receive the event, parentId:"+parentId);
            var p = await sIota.path(parentId);
            var site = process.env.CC_HOST + p.path;
            //var site = 'https://undebate-stage1.herokuapp.com' + p.path;  
            console.log("site=" +site);
            var d = new Date();
            var image_fname = 'site_preview_'+ d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate() +'.png';
            await undebate_site_preview(site, image_fname);
            
            //unload to Cloudnary
            var iUrl='';
            await cloudinary.uploader.upload(image_fname, { tags: 'undebate' }, function (err, image) {
                if (err) { console.warn(err); }
                iUrl = image.url;
                console.log("* File Upload to Cloudinary " + image.url);
            });

            //update smpreview record into Iota
            await sIota.update_smpreview(parentId,iUrl);
            await sIota.disconnect();
        }
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