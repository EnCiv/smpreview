
'use strict';

const sIota = require('./smpreview_iota');
const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;
const sleep = require('system-sleep');


async function main() {
    try {
        while(1) //forever to wait for event from Enciv
        {
            await sIota.connectInit();
            // Scan DBs to find out events/parentIds which smpreviews need to be created or updated
            var parentIds = await sIota.Get_parentId4simprview();
            if(parentIds.length){
                for await (const pId of parentIds) {
                    console.log("Found a need to create or update the social preview image for parentId:"+pId.parentId );

                    var parentId = pId.parentId;

                    //Process the Event to create Smpreview.
                    var p = await sIota.path(parentId);
                    
                    var site = 'https://undebate-stage1.herokuapp.com' + p.path; //debug mode, process.env does not be set in debug
                    //var site = process.env.CC_HOST + p.path;
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
                };
            }
            await sIota.disconnect();
            //wait for 24 hrs
            //await sleep(5000); //debug to set 5 sec.
            await sleep(86400000);
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