'use strict';

// return true if there's a difference, false if not.  Show any differences. 
// if a property is an object and the property has an id field, show the difference of that -> but don't go deeper into properties.

function showShallowDiff(obj1, obj2) {
    const args=global.args||{};
    var differences=false;
    if (!args.diff) return;
    Object.keys(obj1).forEach(key => {
        if (obj1[key] && typeof obj1[key] === "object" && obj1[key]!==null) { // it's an object
            if(obj2[key] && typeof obj2[key]==='object' && obj2[key]!== null) { // it's an object too
                if (obj1[key].id !== obj2[key].id) {
                    args.diff && console.error(key + '.id', obj1[key].id, "!==", obj2[key].id);
                    differences=true;
                }
            } else {
                args.diff && console.error(key + obj1[key], "!==", obj2[key], "not an object");
                differences=true;
            }
        } else {  // obj1[key] is not an object
            if (typeof obj2[key] === "undefined" && typeof obj1[key] !== 'undefined') {
                args.diff && console.error(key + ':', obj1[key], "!==", obj2[key]);
                differences=true;
            }
            if (obj1[key] !== obj2[key]){
                 args.diff && console.error(key + ':', obj1[key], "!==", obj2[key]);
                 differences=true;
            }
        }
    })
    return differences;
}

module.exports=showShallowDiff;
