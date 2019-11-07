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
let dataSumadaHispanos = new Array();
let dataSumadaXsite = new Object();
let dataSumadaBrasil = new Array();
// let casosPordíaHispanos = new Object();
// let casosPordíaBrasil = new Object();

for (let row in query) {
    let procesado = false;
    let cx_case = query[row];
    let from_dt = moment(cx_case.INTERACTION_FROM_DT);
    let to_dt = moment(cx_case.INTERACTION_TO_DT);
    let createdDate = from_dt.format('YYYY-MM-DD').toString();

    // if (!casosPordíaBrasil[createdDate]) 
    //     casosPordíaBrasil[createdDate] = 0;
    //     if (!casosPordíaHispanos[createdDate]) 
    //     casosPordíaHispanos[createdDate] = 0;
    
   // if (createdDate.indexOf('2019-07') > -1){
        if(cx_case.CENTER == 'HISPANOS') {
            
            //Busco si entro en un dia no laborale
            for (let dia in daysOffHispanos) {
                let dayoff = moment(daysOffHispanos[dia]).hours(20).minutes(59).seconds(59);
                //Si es de un día no laborable
                if(daysOffHispanos[dia] == from_dt.format('YYYY-MM-DD')) {
                    procesado = true;
                    //Saco la diferencia entre el cx_case y el final del feriado
                    let duration = moment.duration(
                        moment(dayoff)
                            .diff(from_dt));
                    //Lo paso a horas
                    let diffInHours = (duration.asSeconds() + (3600*3) )/3600;
                    
                    //Se lo resto a la sumatoria
                    query[row].TMR_HOURS -= (diffInHours.toFixed(6));
    
                    //Si entro un sabado: ya le restamos la diferencia, se le resta también el domingo
                    if (from_dt.day() == 6) {
                        query[row].TMR_HOURS -= 24;
                    }
                    if (from_dt.day() == 5) {
                        query[row].TMR_HOURS -= 24*2;
                    }
                }
                       
            }
            //Si no fue en un dia no laborable
            if (!procesado){
                if(from_dt.week() !=  to_dt.week()){
                    const range = moment.range(from_dt, to_dt)
                    const arrayOfDates = Array.from(range.by('days'))
                    const toRest = compare(arrayOfDates,daysOffHispanos)
                    query[row].TMR_HOURS -= 24*toRest;
                }
            }

            //Lo sumo a la cuenta por día
            // casosPordíaHispanos[createdDate]++;

        } else {
    
            //Busco si entro en un dia no laborale
            for (let dia in daysOffBrasil) {
                let dayoff = moment(daysOffBrasil[dia]).hours(20).minutes(59).seconds(59);
                //Si es de un día no laborable
                if(daysOffBrasil[dia] == from_dt.format('YYYY-MM-DD')) {
                    procesado = true;
                    //Saco la diferencia entre el cx_case y el final del feriado
                    let duration = moment.duration(
                        moment(dayoff)
                            .diff(from_dt));
                    //Lo paso a horas
                    let diffInHours = (duration.asSeconds() + (3600*3) )/3600;
                    
                    //Se lo resto a la sumatoria
                    query[row].TMR_HOURS -= (diffInHours.toFixed(6));
    
                    //Si entro un sabado: ya le restamos la diferencia, se le resta también el domingo
                    if (from_dt.day() == 6) {
                        query[row].TMR_HOURS -= 24;
                    }
                    if (from_dt.day() == 5) {
                        query[row].TMR_HOURS -= 24*2;
                    }
                }
                       
            }
            //Si no fue en un dia no laborable
            if (!procesado){
                if(from_dt.week() !=  to_dt.week()){
                    const range = moment.range(from_dt, to_dt)
                    const arrayOfDates = Array.from(range.by('days'))
                    const toRest = compare(arrayOfDates,daysOffBrasil)
                    query[row].TMR_HOURS -= 24*toRest;
                }
            }
         //   casosPordíaBrasil[createdDate]++;

        }
    
        if(cx_case.CENTER == 'HISPANOS') {
            dataSumadaXsite[cx_case.SITE] == undefined ?   dataSumadaXsite[cx_case.SITE] = new Array() : dataSumadaXsite[cx_case.SITE].push(Number(cx_case.TMR_HOURS));
            dataSumadaHispanos.push(Number(cx_case.TMR_HOURS));
        }else{
            dataSumadaBrasil.push(Number(cx_case.TMR_HOURS));
        }
        
   // } 

}

let totalArg = 0;
let total48hs = 0;
let total72hs = 0;
let total96hs = 0;
let totalBr = 0;
let totalBr72hs = 0;
let totalBr96hs = 0;
let totalBr120hs = 0;
let generalArg = 0;
let generalBr = 0;

let totalXSite = {
}

for (var property in dataSumadaXsite) {
    if (dataSumadaXsite.hasOwnProperty(property)) {
      // Do things here
        totalXSite[property] = {
            total: 0,
            total48hs: 0, 
            total72hs: 0, 
            total96hs: 0, 
        }
        dataSumadaXsite[property].forEach((time) => {
            totalXSite[property].total++;
            if(time < 49){
                totalXSite[property].total48hs++;
            }
            if(time < 73){
                totalXSite[property].total72hs++;
            }
            if(time < 97){
                totalXSite[property].total96hs++;
            }
        });
    }
  }

dataSumadaHispanos.forEach((time) => {
    totalArg++;
    if(time < 49){
        total48hs++;
    }
    if(time < 73){
        total72hs++;
    }
    if(time < 97){
        total96hs++;
    }
    generalArg += time;
});
dataSumadaBrasil.forEach((time) => {
    totalBr++;
    if(time < 73){
        totalBr72hs++;
    }
    if(time < 97){
        totalBr96hs++;
    }
    if(time < 121){
        totalBr120hs++;
    }
    generalBr += time;
});

console.log( "Hispanos Total --->", totalArg);
console.log( "Hispanos TMR --->", generalArg / totalArg);
console.log( "Hispanos Total 48hs --->",total48hs, ' ------' , (total48hs * 100 / totalArg).toFixed(2) + '%' )
console.log( "Hispanos Total 72hs --->",total72hs, ' ------' , (total72hs * 100 / totalArg).toFixed(2) + '%' )
console.log( "Hispanos Total 96hs --->",total96hs, ' ------' , (total96hs * 100 / totalArg).toFixed(2) + '%' )
console.log("----------------------");

console.log( "Brasil Total --->", totalBr);
console.log( "Brasil TMR --->", generalBr / totalBr);
console.log( "Brasil Total 72hs --->",totalBr72hs, ' ------' , (totalBr72hs * 100 / totalBr).toFixed(2) + '%' )
console.log( "Brasil Total 96hs --->",totalBr96hs, ' ------' , (totalBr96hs * 100 / totalBr).toFixed(2) + '%' )
console.log( "Brasil Total 120hs --->",totalBr120hs, ' ------' , (totalBr120hs * 100 / totalBr).toFixed(2) + '%' )

for (var property in totalXSite) {
    if (totalXSite.hasOwnProperty(property)) {

      // Do things here
        console.log('Porcentaje de sla para ', property)
        console.log( `${property} 48hs`, ' ------' , (totalXSite[property].total48hs * 100 / totalXSite[property].total).toFixed(2) + '%' )
        console.log( `${property} 72hs`, ' ------' , (totalXSite[property].total72hs * 100 / totalXSite[property].total).toFixed(2) + '%' )
        console.log( `${property} 96hs`, ' ------' , (totalXSite[property].total96hs * 100 / totalXSite[property].total).toFixed(2) + '%' )
        console.log("----------------------");

    }
}





// let keysSorted = Object.keys(casosPordíaBrasil).sort(function(a,b){return a.slice(-2)-b.slice(-2)})
// let totalesPorDia = new Array();
// for (let x in keysSorted) {
//     let day = keysSorted[x];
//     let item = {};
//     item.Día = day
//     item['Hispanos'] = casosPordíaHispanos[day];
//     item.Brasil = casosPordíaBrasil[day];
//     totalesPorDia.push(item);
// }


// console.log(totalesPorDia)
