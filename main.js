
'use strict';

const encivInfo = require('./enciv-info');

global.args = {
    year: "2020",  // the year to take race data from
    diff: true // use "" in the command line for false, if you set this to anything it will show shallow differences when errors are detected
};

async function main() {
    try {
        await encivInfo.init(args.year + '-01-01');
        console.info("encivInfo.init complete",Object.keys(encivInfo.viewers).length,Object.keys(encivInfo.participants).length,Object.keys(encivInfo.recorders).length);

        // the code to do the social media preview image should go in here 

        await encivInfo.disconnect();
    }
    catch(err){
        console.error(err);
    }
}

main();