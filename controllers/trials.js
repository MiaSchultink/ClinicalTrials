
const fetch = require('node-fetch')
const fs = require('fs');
const Study = require('../models/study');
const Location = require('../models/location');
const Method = require('../models/method');
const Participants = require('../models/participants');
const Results = require('../models/results');

const generalFields = ["NCTId", "OfficialTitle", "Phase", "BriefSummary", "CollaboratorName", "DetailedDescription", "EnrollmentCount", "IsFDARegulatedDevice", "IsFDARegulatedDrug"];
const stateFields = ["NCTId", "Phase", "OverallStatus", "DesignPrimaryPurpose"]

const locationFields = ["NCTId", "LocationFacility", "LocationCity", "LocationCountry"];
const methodFields = ["NCTId", "DesignInterventionModel", "DesignInterventionModelDescription", "DesignAllocation", "PrimaryOutcomeMeasure", "OutcomeMeasureDescription"];
const participantFields = ["NCTId", "Gender", "MinimumAge", "MaximumAge"];
const resultFields = ["NCTId", "PrimaryOutcomeDescription", "WhyStopped"];

const dateFields = ["NCTId", "StartDate", "CompletionDate"]

exports.wipeAll = async (req, res, next) => {
    await Study.deleteMany().exec();
    await Location.deleteMany().exec();
    await Method.deleteMany().exec();
    await Participants.deleteMany().exec();
    res.redirect('/');
}

function monthToIndex(month){
    let index = 0;
    switch(month){
        case 'January':{
            index = 0;
        }
        case 'February':{
            index=1;
        }
        case 'March':{
            index=2;
        }
        case 'April':{
            index=3;
        }
        case 'May':{
            index=4;
        }
        case 'June':{
            index=5
        }
        case 'July':{
            index=6;
        }
        case 'August':{
            index=7;
        }
        case 'September':{
            index=8;
        }
        case 'October':{
            index=9;
        }
        case 'November':{
            index=10;
        }
        case 'December':{
            index=11;
        }
    }
    return index;
}

function buildURL(fields) {
    const numStudiesToServe = 10;
    const urlStart = "https://clinicaltrials.gov/api/query/study_fields?expr=Duchenne+Muscular+Dystrophy&fields=";
    const urlEnd = "&min_rnk=1&max_rnk=" + numStudiesToServe + "&fmt=JSON";

    let urlMiddle = "";
    for (let i = 0; i < fields.length - 1; i++) {
        urlMiddle += fields[i] + "%2C";
    }
    urlMiddle += fields[fields.length - 1];

    const URL = urlStart + urlMiddle + urlEnd;

    return URL;
}

function makeJASONfile(data, fileName) {
    const name = fileName + ".json";
    fs.writeFileSync(name, data);
    console.log("JSON data is saved.", fileName);
}


async function fetchJSON(fields) {
    const url = buildURL(fields);
    const response = await fetch(url);
    const json = await response.json();
    return json;
}


// dont run with nodemon
exports.buildJSONFiles = async (req, res, next) => {

    console.log("making general file")
    const generalJSON = await fetchJSON(generalFields);
    const generalData = JSON.stringify(generalJSON);
    makeJASONfile(generalData, "studies");

    console.log("making location file")
    const locationJSON = await fetchJSON(locationFields);
    const locData = JSON.stringify(locationJSON);
    makeJASONfile(locData, "locations");
    console.log("location file made");

    console.log("making method file")
    const methodJSON = await fetchJSON(methodFields);
    const methodData = JSON.stringify(methodJSON);
    makeJASONfile(methodData, "methods");

    console.log("making participants file")
    const participantJSON = await fetchJSON(participantFields);
    const parData = JSON.stringify(participantJSON);
    makeJASONfile(parData, "participants");

    console.log("making dates file")
    const datesJSON = await fetchJSON(dateFields);
    const dateData = JSON.stringify(datesJSON);
    makeJASONfile(dateData, "dates");

    console.log("making state files")
    const statJSON = await fetchJSON(stateFields);
    const statData = JSON.stringify(statJSON);
    makeJASONfile(statData, "states");

    console.log("making results files")
    const resultsJSON = await fetchJSON(resultFields);
    const resData = JSON.stringify(resultsJSON);
    makeJASONfile(resData, "resutls");

    res.status(200).end()
}

async function makeStudies() {
    await Study.deleteMany().exec();

    const json = await fetchJSON(generalFields);
    const jsonStudies = json.StudyFieldsResponse.StudyFields;

    const numStudies = 10;

    for (let i = 0; i < numStudies; i++) {
        console.log(i);
        const isFDA = jsonStudies[i].IsFDARegulatedDevice[0] == "Yes" || jsonStudies[i].IsFDARegulatedDrug[0] == "Yes";

        const study = new Study({
            rank: jsonStudies[i].Rank,
            NCTID: jsonStudies[i].NCTId[0],
            officialTitle: jsonStudies[i].OfficialTitle[0],
            briefSumarry: jsonStudies[i].BriefSummary[0],
            detailedDescription: jsonStudies[i].DetailedDescription[0],
            enrollment: jsonStudies[i].EnrollmentCount[0],
            isFDAreg: isFDA,
            creators: jsonStudies[i].CollaboratorName[0]
        })
        console.log("study made id", study.NCTID)
        await study.save();
    }

}

async function addLocations() {
    await Location.deleteMany().exec();
    const json = await fetchJSON(locationFields);
    const jsonStudies = json.StudyFieldsResponse.StudyFields;

    for (jsonStudy of jsonStudies) {
        const dbStudy = await Study.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
        if (dbStudy != null) {
            console.log("location id", dbStudy.NCTID)
            let loc = await Location.findOne({ facility: jsonStudy.LocationFacility[0] }).exec();
            if (!loc) {
                loc = new Location({
                    country: jsonStudy.LocationCountry[0],
                    city: jsonStudy.LocationCity[0],
                    facility: jsonStudy.LocationFacility[0]
                })
                //console.log(loc);
                await loc.save();
            }
            dbStudy.location = loc._id;
            await dbStudy.save();
        }
    }

}

async function addMethods() {
    await Method.deleteMany().exec();

    const json = await fetchJSON(methodFields);

    const jsonStudies = json.StudyFieldsResponse.StudyFields;

    for (jsonStudy of jsonStudies) {
        const dbStudy = await Study.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
        if (dbStudy != null) {
            console.log("method id", dbStudy.NCTID)
            const alloc = jsonStudy.DesignAllocation[0];
            const interModel = jsonStudy.DesignInterventionModel[0];
            const pOutcomeMeasure = jsonStudy.PrimaryOutcomeMeasure[0];
            const OMDescription = jsonStudy.OutcomeMeasureDescription[0];

            const method = new Method({
                allocation: alloc,
                interventionModel: interModel,
                primaryOutcomeMeasure: pOutcomeMeasure,
                outcomeMeasureDescription: OMDescription
            })
            await method.save();
            dbStudy.method = method._id;
            await dbStudy.save();

        }
    }
}

async function addParticipatns() {
    await Participants.deleteMany().exec();

    const json = await fetchJSON(participantFields);
    const jsonStudies = json.StudyFieldsResponse.StudyFields;

    for (jsonStudy of jsonStudies) {
        const dbStudy = await Study.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
        if (dbStudy != null) {
            console.log("participants study id", dbStudy.NCTID);

            const pars = new Participants({
                gender: jsonStudy.Gender[0],
            })

            if (jsonStudy.MinimumAge[0] != null) {
                const strMinAge = JSON.stringify(jsonStudy.MinimumAge[0]);
                const splitMinAge = strMinAge.split(" ");
                const minStrNum = splitMinAge[0].substring(1);
                const numMinAge = Number(minStrNum);

                console.log(numMinAge);
                pars.minAge = numMinAge
            }
            if (jsonStudy.MaximumAge[0] != null) {
                const strMaxAge = JSON.stringify(jsonStudy.MaximumAge[0])
                const splitMaxAge = strMaxAge.split(" ");
                const maxStrNum = splitMaxAge[0].substring(1);
                const numMaxAge = Number(maxStrNum);

                console.log(numMaxAge);
                pars.maxAge = numMaxAge;

            }
            await pars.save();
            dbStudy.participants = pars._id;
            await dbStudy.save();
        }
    }

}

async function addResults() {
    await Results.deleteMany().exec();
    const json = await fetchJSON(resultFields);
    const jsonStudies = json.StudyFieldsResponse.StudyFields;

    for (jsonStudy of jsonStudies) {
        const dbStudy = await Study.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
        if (dbStudy != null) {
            console.log("results id", dbStudy.NCTID)
            const result = new Results({
                primaryOutcomeDescription: jsonStudy.PrimaryOutcomeDescription[0],
                whyStopped: jsonStudy.WhyStopped[0]
            })
            await result.save();
            dbStudy.results = result._id
            await dbStudy.save();
        }
    }
}

async function addDates() {
   
    const json = await fetchJSON(dateFields);
    const jsonStudies = json.StudyFieldsResponse.StudyFields;

    for (jsonStudy of jsonStudies) {
        const dbStudy = await Study.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
        if (dbStudy != null) {
            console.log("date id", dbStudy.NCTID);

            const jsonSDate = jsonStudy.StartDate[0];
            let stringSDate = JSON.stringify(jsonSDate);
            stringSDate = stringSDate.substring(1);
            const splitSDate = stringSDate.split(" ");
           
            let sYear ="";
            let sDay = "";
            if(splitSDate.length ==2){
                sYear = splitSDate[1];
            }
            else if(splitSDate.length==3){
                sDay = splitSDate[1];
                sYear = splitSDate[2];
            }
            const sMonthStr = splitSDate[0];
            const sMonthIndex = monthToIndex(sMonthStr);
            sDay = sDay.substring(0, sDay.length - 1)
            sYear = sYear.substring(0, sYear.length - 1);

            const startD = new Date(sYear+'/'+ sMonthIndex +'/'+sDay)
            console.log(startD);
            dbStudy.startDate = startD;

            if (jsonStudy.CompletionDate[0]!=null) {
                const jsonCDate = jsonStudy.CompletionDate[0];
                let stringCDate = JSON.stringify(jsonCDate);
                stringSDate = stringCDate.substring(1);
                const splitCDate = stringCDate.split(" ");

                let cYear ="";
                let cDay = "";
                if(splitCDate.length ==2){
                    cYear = splitCDate[1];
                }
                else if(splitCDate.length==3){
                    cDay = splitCDate[1];
                    cYear = splitCDate[2];
                }
                const cMonthStr = splitSDate[0];
                const cMonthIndex = monthToIndex(cMonthStr);
                cDay = cDay.substring(0, cDay.length - 1)
                cYear = cYear.substring(0, cYear.length - 1);
                
                const compD = new Date(cYear+'/'+ cMonthIndex+'/'+cDay);
                console.log(compD);

                dbStudy.compDate = compD;
            }
            await dbStudy.save();
        }

    }
}

async function addStates() {

    const json = await fetchJSON(stateFields);
    const jsonStudies = json.StudyFieldsResponse.StudyFields;

    for (jsonStudy of jsonStudies) {
        const dbStudy = await Study.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
        if(dbStudy!=null){
            console.log('state id',dbStudy.NCTID);


            dbStudy.phase = jsonStudy.Phase[0];
            dbStudy.status = jsonStudy.OverallStatus[0];
            dbStudy.purpose = jsonStudy.DesignPrimaryPurpose[0];

            await dbStudy.save();
        }
       

        
    }

}

///doesnt work yet becuase response redirects
exports.run = async (req, res, next) => {
    //making studies
    await makeStudies();
    console.log("studies made");
    //adding locations
    await addLocations();
    console.log("locations added");
    //adding methods
    await addMethods();
    console.log("methods added")
    //adding participants
    await addParticipatns();
    console.log('participants added')
    //adding study dates
    await addDates();
    console.log('dates added');
    //adding state of study
    await addStates();
    console.log('states added')
    //adding results
    await addResults();
    console.log("resutls added");
    res.redirect('/');
}