
const fetch = require('node-fetch')
const fs = require('fs');
const Study = require('../models/study');
const Location = require('../models/location');
const Method = require('../models/method');
const participants = require('../models/participants');
//const Participants = require('../models/participants');

const generalFields = ["NCTId","OfficialTitle", "OverallStatus", "Phase", "BriefSummary","CollaboratorName", "StartDate", "CompletionDate", "DetailedDescription","EnrollmentCount","IsFDARegulatedDevice", "IsFDARegulatedDrug","DesignPrimaryPurpose"];

const locationFields = ["NCTId","LocationFacility", "LocationCity", "LocationCountry"];
const methodFields = ["NCTId","DesignInterventionModel", ,"InterventionType","DesignInterventionModelDescription","DesignAllocation","OutcomeMeasureDescription"];
const participantFields = ["NCTId","Gender", "MinimumAge", "MaximumAge"];
const resultFields = ["NCTId","PrimaryOutcomeDescription","WhyStopped"]

//const fieldsArray = ["NCTId", "OfficialTitle", "OverallStatus", "Phase", "BriefSummary", "CollaboratorName", "CompletionDate", "DetailedDescription", "EnrollmentCount", "Gender", "MinimumAge", "MaximumAge", "InterventionDescription", "IsFDARegulatedDevice", "IsFDARegulatedDrug", "LocationFacility", "LocationCity", "LocationCountry", "OutcomeMeasureDescription", "PrimaryOutcomeDescription"];


exports.WIPEALL =async (req, res, next)=>{
    await Study.deleteMany().exec();
    await Location.deleteMany().exec();
    await Method.deleteMany().exec();
    await participants.deleteMany().exec();
    res.redirect('/');
    }


function buildURL(fields) {
    const urlStart = "https://clinicaltrials.gov/api/query/study_fields?expr=Duchenne+Muscular+Dystrophy&fields=";
    const urlEnd = "&min_rnk=1&max_rnk=794&fmt=JSON";

    let urlMiddle = "";
    for (let i = 0; i < fields.length - 1; i++) {
        urlMiddle += fields[i] + "%2C";
    }
    urlMiddle += fields[fields.length - 1];

    const URL = urlStart + urlMiddle + urlEnd;

    return URL;
}

function makeJASONfile(data, fileName) {
    const name = fileName+".json";
    fs.writeFileSync(name, data);
    console.log("JSON data is saved.");

}


async function fetchJSON(fields) {
    const url = buildURL(fields);
    const response = await fetch(url);
    const json = await response.json();
    return json;
}

// //makes big json file
// exports.getAllTrials = async (req, res, next) => {
//     const url = buildURL(fieldsArray);

//     //const url = buildURL(testFields);

//     const response = await fetch(url);
//     console.log(response)
//     const json = await response.json();
//     console.log(json);
//     const data = JSON.stringify(json);


//     makeJASONfile(data,"alltrials");
//     res.redirect('/');
// }

exports.buildJSONFiles = async (req, res, next) =>{

    console.log("making general file")
    const generalJSON = await fetchJSON(generalFields);
    let data = JSON.stringify(generalJSON);
    makeJASONfile(data,"studies");

    console.log("making location file")
    const locationJSON = await fetchJSON(locationFields);
    data = JSON.stringify(locationJSON);
    makeJASONfile(data,"locations");

    console.log("location file made");
    // console.log("making method file")
    // const methodJSON = await fetchJSON(methodFields);
    // data = JSON.stringify(methodJSON);
    // makeJASONfile(data,"methods");

    // console.log("making participants file")
    // const participantJSON = await fetchJSON(participantFields);
    // data = JSON.stringify(participantJSON);
    // makeJASONfile(data,"participants");

    res.redirect('/')
}

async function makeStudies() {
    await Study.deleteMany().exec();

    //const json = await fetchJSON(fieldsArray)
    const json = await fetchJSON(generalFields);
//console.log(json)
    const jsonStudies = json.StudyFieldsResponse.StudyFields;

    const numStudies = jsonStudies.length;

    for (let i = 0; i < numStudies; i++) {
        console.log(i);
        const isFDA =  jsonStudies[i].IsFDARegulatedDevice[0] =="Yes" || jsonStudies[i].IsFDARegulatedDrug[0] == "Yes";
        const study = new Study({
            rank: jsonStudies[i].Rank,
            NCTID: jsonStudies[i].NCTId[0],
            phase: jsonStudies[i].Phase[0],
            status: jsonStudies[i].OverallStatus[0],
            officialTitle: jsonStudies[i].OfficialTitle[0],
            briefSumarry: jsonStudies[i].BriefSummary[0],
            detailedDescription: jsonStudies[i].DetailedDescription[0],
            enrollment: jsonStudies[i].EnrollmentCount[0],
            isFDAreg: isFDA,
            creators: jsonStudies[i].CollaboratorName[0],
            purpose: jsonStudies[i].DesignPrimaryPurpose[0]
            
        })

        await study.save();
        console.log("title",study.officialTitle);
    }

}

async function addLocations() {
    await Location.deleteMany().exec();
    //const json = await fetchJSON(fieldsArray);
    const json = await fetchJSON(locationFields);

    console.log(json);

    const jsonStudies = json.StudyFieldsResponse.StudyFields;

    for (jsonStudy of jsonStudies) {
        const dbStudy = await Study.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
        //console.log(dbStudy);
        if (dbStudy != null) {
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

async function addMethod(){
    await Method.deleteMany().exec();

   // const json = await fetchJSON(fieldsArray);
   const json = await fetchJSON(methodFields);

    const jsonStudies = json.StudyFieldsResponse.StudyFields;

    for (jsonStudy of jsonStudies) {
        const dbStudy = await Study.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
        if (dbStudy != null) {
            let method = await Method.find({interventionModel: jsonStudy.InterventionModel[0]})
            if(!method){
               
            }
        }
    }
}


///doesnt work yet becuase response redirects
exports.run = async (req, res, next) => {
    //making studies
   await makeStudies();
    //adding locations
   await  addLocations();
}