
const fetch = require('node-fetch')
const fs = require('fs');
const Study = require('../models/study');
const Location = require('../models/location');


const fieldsArray = ["NCTId", "OfficialTitle", "OverallStatus", "Phase", "BriefSummary", "CollaboratorName", "CompletionDate", "DetailedDescription", "EnrollmentCount", "Gender", "MinimumAge", "MaximumAge", "InterventionDescription", "IsFDARegulatedDevice", "IsFDARegulatedDrug", "LocationFacility", "LocationCity", "LocationCountry", "OutcomeMeasureDescription", "PrimaryOutcomeDescription"];


//const testFields = ["NCTId", "CollaboratorName", "MinimumAge", "MaximumAge", "LocationFacility", "StartDate", "CompletionDate"];

exports.WIPEALL =async (req, res, next)=>{
    await Study.deleteMany().exec();
    await Location.deleteMany().exec();
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

function makeJASONfile(data) {
    fs.writeFile('trials.json', data, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
}


async function fetchJSON(fields) {
    const url = buildURL(fields);
    const response = await fetch(url);
    const json = await response.json();
    return json;
}

// exports.printAllTrials2 = async (req, res, next) => {
//     const url = 'https://ClinicalTrials.gov/api/query/full_studies?expr=heart+attack&fmt=JSON'
//     const response = await fetch(url);
//     const json = await response.json();

//     console.log(json.FullStudiesResponse.FullStudies[0])
// }

exports.getAllTrials = async (req, res, next) => {
    const url = buildURL(fieldsArray);

    //const url = buildURL(testFields);

    const response = await fetch(url);
    console.log(response)
    const json = await response.json();
    console.log(json);
    const data = JSON.stringify(json);


    makeJASONfile(data);
    res.redirect('/');
}

exports.makeStudies = async (req, res, next) => {
    await Study.deleteMany().exec();

    const json = await fetchJSON(fieldsArray)
    const jsonStudies = json.StudyFieldsResponse.StudyFields;

    const numStudies = jsonStudies.length;

    for (let i = 0; i < numStudies; i++) {
        console.log(i);
        const study = new Study({
            rank: jsonStudies[i].Rank,
            NCTID: jsonStudies[i].NCTId[0],
            officialTitle: jsonStudies[i].OfficialTitle[0],
            briefSumarry: jsonStudies[i].BriefSummary[0],
            detailedDescription: jsonStudies[i].DetailedDescription[0],
            enrollment: jsonStudies[i].EnrollmentCount[0],
        })

        await study.save();
        console.log("title",study.officialTitle);
    }
    res.redirect('/');
}

exports.addLocations = async (req, res, next) => {
    await Location.deleteMany().exec();
    const json = await fetchJSON(fieldsArray);

    const jsonStudies = json.StudyFieldsResponse.StudyFields;

    for (jsonStudy of jsonStudies) {
        const dbStudy = await Study.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
        console.log(dbStudy);
        if (dbStudy != null) {
            let loc = await Location.findOne({ facility: jsonStudy.LocationFacility[0] }).exec();
            if (!loc) {
                loc = new Location({
                    country: jsonStudy.LocationCountry[0],
                    city: jsonStudy.LocationCity[0],
                    facility: jsonStudy.LocationFacility[0]
                })
                await loc.save();
            }
            dbStudy.location = loc._id;
            await dbStudy.save();
        }
    }

    res.redirect('/');
}



exports.run = (req, res, next) => {
    //making studies
    this.makeStudies(req, res, next);
    //adding locations
    this.addLocations(req, res, next);
}