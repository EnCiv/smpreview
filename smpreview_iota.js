
'use strict';

const Iota=require('iota')();
const MongoModels=require('mongo-models');

var smpreview_iota = {_ids: {}};
var smpreview_subject = 'Simple preview image for socal network query, facebook, tweet';
var smpreview_description = 'Snapshot png image filelink saved in Cloudinary';

async function path(parentId) {
    var data = [];
    return new Promise(async (ok, ko) => {
        try {
            data=await Iota.findOne({_id:Iota.ObjectID(parentId)});
            return ok(data);
            }
        catch (error) {
            console.error("sIota.path() caught error", error);
            return ko(error)
        }
    })
}
function init(){
    return new Promise(async (ok,ko)=>{
        try{
            await Iota.connectInit();
            return ok();
        }
        catch(err){
            ko(err);
        }
    })
}

function disconnect(){
    MongoModels.disconnect();
}
function update_smpreview(pId, iUrl){
    var data = [];
    return new Promise(async (ok,ko)=>{
        try{
            var query='{parentId: '+pId+'}';
            data=await Iota.findOneAndDelete(
                {
                    $and: [
                            {parentId: pId},
                            {"component.component": "smpreview"}
                        ]
                }
            )
            const result = await Iota.insertOne(
                {
                    parentId: pId, 
                    subject: smpreview_subject, 
                    description: smpreview_description, 
                    component: {component: 'smpreview', imgUrl: iUrl}
                }
            );
            if(result && result.length===1)
                ok(result[0]);
            else {
                const msg=`unexpected number of results received ${results.length}`
                logger.error(msg)
                ko(new Error(msg));
            }
            return ok();
        }
        catch(err){
            ko(err);
        }
    })

}

smpreview_iota.connectInit=init;
smpreview_iota.disconnect=disconnect;
smpreview_iota.path=path;
smpreview_iota.update_smpreview=update_smpreview;

module.exports=smpreview_iota;