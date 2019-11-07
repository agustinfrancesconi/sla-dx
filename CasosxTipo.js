const query = require('./info/dataQ3.json');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment( require('moment'));
const { daysOffHispanos, daysOffBrasil } = require('./info/dayOff');

const compare = (arr1, arr2) => {
    const finalArray = [];
    arr1.forEach( (e1) => arr2.forEach((e2)=>{
        if(e1.format('YYYY-MM-DD')===e2)finalArray.push(e1);
    }));
    return finalArray.length;
}

//Sumo to
let casos = new Object();

for (let row in query) {
    let cx_case = query[row];

    if (!casos.hasOwnProperty(cx_case.PROCESS_TO) ) {
        casos[cx_case.PROCESS_TO] = 0;
    }
    casos[cx_case.PROCESS_TO] ++;
}


function sortProperties(obj)
{
  // convert object into array
	var sortable=[];
	var test= {};
	for(var key in obj)
		if(obj.hasOwnProperty(key))
			sortable.push([key, obj[key]]); // each item is an array in format [key, value]
	
	// sort items by value
	sortable.sort(function(a, b)
	{
		var x=a[1]
			y=b[1]
		return x<y ? -1 : x>y ? 1 : 0;
    });
    
   // return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
    
    for(var key in sortable)
		test[sortable[key][0]] = sortable[key][1];
    
    return test;
}

console.log(sortProperties(casos))