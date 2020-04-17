const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment( require('moment'));
const { daysOffHispanos, daysOffBrasil } = require('./info/dayOff');
const csvFilePath='info/data.csv'

let  query = [];

const csv=require('csvtojson')

csv()
.fromFile(csvFilePath)
.then((jsonObj)=>{
    query = jsonObj;

    const compare = (arr1, arr2) => {
        const finalArray = [];
        arr1.forEach( (e1) => arr2.forEach((e2)=>{
            if(e1.format('YYYY-MM-DD')===e2)finalArray.push(e1);
        }));
        return finalArray.length;
    }

    //Sumo to
    let dataSumadaHispanos = new Object();
    let dataSumadaHispanosTotal = new Object();
    let dataSumadaBrasilTotal = new Object();
    let dataSumadaBrasil = new Object();
    let promediototalbr = 0;
    let promediototalhisp = 0;
    let promediototaltotalhisp = 0;
    let promediototaltotalbr = 0;

    for (let row in query) {
        let procesado = false;
        let cx_case = query[row];
        let from_dt = moment(cx_case.INTERACTION_FROM_DT);
        let to_dt = moment(cx_case.INTERACTION_TO_DT);
        
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
                    cx_case.TMR_HOURS -= (diffInHours.toFixed(6));

                    //Si entro un sabado: ya le restamos la diferencia, se le resta también el domingo
                    if (from_dt.day() == 6) {
                        cx_case.TMR_HOURS -= 24;
                    }
                    if (from_dt.day() == 5) {
                        cx_case.TMR_HOURS -= 24*2;
                    }
                }
                        
            }
            //Si no fue en un dia no laborable
            if (!procesado){
                if(from_dt.week() !=  to_dt.week()){
                    const range = moment.range(from_dt, to_dt)
                    const arrayOfDates = Array.from(range.by('days'))
                    const toRest = compare(arrayOfDates,daysOffHispanos)
                    cx_case.TMR_HOURS -= 24*toRest;
                }
            }


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
                    cx_case.TMR_HOURS -= (diffInHours.toFixed(6));

                    //Si entro un sabado: ya le restamos la diferencia, se le resta también el domingo
                    if (from_dt.day() == 6) {
                        cx_case.TMR_HOURS -= 24;
                    }
                    if (from_dt.day() == 5) {
                        cx_case.TMR_HOURS -= 24*2;
                    }
                }
                        
            }
            //Si no fue en un dia no laborable
            if (!procesado){
                if(from_dt.week() !=  to_dt.week()){
                    const range = moment.range(from_dt, to_dt)
                    const arrayOfDates = Array.from(range.by('days'))
                    const toRest = compare(arrayOfDates,daysOffBrasil)
                    cx_case.TMR_HOURS -= 24*toRest;
                }
            }

        }

        if(cx_case.CENTER == 'HISPANOS') {
            var mondayOfWeek = moment().isoWeek(from_dt.isoWeek()).day(1).format('D/M')
            if (!dataSumadaHispanos[mondayOfWeek]) {
                dataSumadaHispanos[mondayOfWeek] = 0;
            }
            if (!dataSumadaHispanosTotal[mondayOfWeek]) {
                dataSumadaHispanosTotal[mondayOfWeek] = 0;
            }

            if(cx_case.TMR_HOURS < 49){
                dataSumadaHispanos[mondayOfWeek]++;
                promediototalhisp++;
            }
            dataSumadaHispanosTotal[mondayOfWeek]++;
            promediototaltotalhisp ++;

        }else{
            var mondayOfWeek = moment().isoWeek(from_dt.isoWeek()).day(1).format('D/M')
            if (!dataSumadaBrasil[mondayOfWeek]) {
                dataSumadaBrasil[mondayOfWeek] = 0;
            }
            if (!dataSumadaBrasilTotal[mondayOfWeek]) {
                dataSumadaBrasilTotal[mondayOfWeek] = 0;
            }

            if(cx_case.TMR_HOURS < 49){
                dataSumadaBrasil[mondayOfWeek]++;
                promediototalbr++;
            }
            dataSumadaBrasilTotal[mondayOfWeek]++;
            promediototaltotalbr ++;

        }

    }

    for (var x in dataSumadaHispanos) {
        dataSumadaHispanos[x] =  Number(dataSumadaHispanos[x] * 100 / dataSumadaHispanosTotal[x]);
    }
    for (var x in dataSumadaBrasil) {
        dataSumadaBrasil[x] =  Number(dataSumadaBrasil[x] * 100 / dataSumadaBrasilTotal[x]);
    }

    console.log("Promedio general total: ", ((promediototalbr+promediototalhisp)*100)/(promediototaltotalhisp + promediototaltotalbr) );
    console.log("Promedio general Hispanos: ", (promediototalhisp*100)/promediototaltotalhisp);
    console.log("Total Hispanos: ", promediototaltotalhisp);
    console.log("Total Hispanos IN: ", promediototalhisp);
    console.log("Total Hispanos OUT: ", promediototaltotalhisp - promediototalhisp);

    console.log('-----------------------------------')
    console.log("Promedio general Brasil: ", (promediototalbr*100)/promediototaltotalbr);
    console.log("Total Brasil: ", promediototaltotalbr);
    console.log("Total Brasil IN: ", promediototalbr);
    console.log("Total Brasil OUT: ", promediototaltotalbr - promediototalbr);
    console.log('-----------------------------------')



    console.log("Semana a semana hispanos:")
    console.log(dataSumadaHispanos);
    console.log('-----------------------------------')

    console.log("Semana a semana Brasil:")
    console.log(dataSumadaBrasil);
})






