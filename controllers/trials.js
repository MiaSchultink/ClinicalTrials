
const fetch = require('node-fetch')
const fs = require('fs');
const Study = require('../models/study');
const Location = require('../models/location');
const Method = require('../models/method');
const Participants = require('../models/participants');
const MinAge = require('../models/minAge');
const MaxAge = require('../models/maxAge');
const Gender = require('../models/gender');
const Results = require('../models/results');
const Purpose = require('../models/purpose');

const generalFields = ["NCTId", "OfficialTitle", "OverallStatus", "Phase", "BriefSummary", "CollaboratorName", "StartDate", "CompletionDate", "DetailedDescription", "EnrollmentCount", "IsFDARegulatedDevice", "IsFDARegulatedDrug", "DesignPrimaryPurpose"];

const locationFields = ["NCTId", "LocationFacility", "LocationCity", "LocationCountry"];
const methodFields = ["NCTId", "DesignInterventionModel", "DesignInterventionModelDescription", "DesignAllocation", "PrimaryOutcomeMeasure", "OutcomeMeasureDescription"];
const participantFields = ["NCTId", "Gender", "MinimumAge", "MaximumAge"];
const resultFields = ["NCTId", "PrimaryOutcomeDescription", "WhyStopped"]

exports.wipeAll = async (req, res, next) => {
    await Study.deleteMany().exec();
    await Location.deleteMany().exec();
    await Method.deleteMany().exec();
    await Participants.deleteMany().exec();
   await Results.deleteMany.exec();
   await MinAge.deleteMany().exec();
   await Purpose.deleteMany().exec();
   await MaxAge.deleteMany().exec();  
   await Gender.deleteMany().exec();
    res.redirect('/');
}


function buildURL(fields) {
    const numStudiesToServe = 10;
    const urlStart = "https://clinicaltrials.gov/api/query/study_fields?expr=Duchenne+Muscular+Dystrophy&fields=";
    const urlEnd = "&min_rnk=1&max_rnk="+numStudiesToServe+"&fmt=JSON";

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

    console.log("making results files")
    const resultsJSON = await fetchJSON(resultFields);
    const resData = JSON.stringify(resultsJSON);
    makeJASONfile(resData, "resutls");

    res.status(200).end()
}

async function makeStudies() {
    await Study.deleteMany().exec();

    //const json = await fetchJSON(fieldsArray)
    const json = await fetchJSON(generalFields);
    //console.log(json)
    const jsonStudies = json.StudyFieldsResponse.StudyFields;

    const numStudies = 10;

    for (let i = 0; i < numStudies; i++) {
        console.log(i);
        const isFDA = jsonStudies[i].IsFDARegulatedDevice[0] == "Yes" || jsonStudies[i].IsFDARegulatedDrug[0] == "Yes";

        let pur = await Purpose.findOne({purpose:jsonStudies[i].DesignPrimaryPurpose[0]}).exec();
        if(!pur){
            pur =new Purpose({
                purpose:jsonStudies[i].DesignPrimaryPurpose[0]
            })
            await pur.save();
        }
        

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
            purpose: pur
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

    // const json = await fetchJSON(fieldsArray);
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
    await MinAge.deleteMany().exec();
    await MaxAge.deleteMany().exec();
    await Gender.deleteMany().exec();
    await Participants.deleteMany().exec();

    const json = await fetchJSON(participantFields);
    const jsonStudies = json.StudyFieldsResponse.StudyFields;

    for (jsonStudy of jsonStudies) {
        const dbStudy = await Study.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
        if (dbStudy != null) {
            console.log("participants study id", dbStudy.NCTID);

            let gen = await Gender.findOne({gender:jsonStudy.Gender[0]}).exec();
            if(!gen){
                gen = new Gender({
                    gender:jsonStudy.Gender[0]
                })
                await gen.save();
            }

            const pars = new Participants({
                gender: gen,
            })

            if (jsonStudy.MinimumAge[0] != null) {
                const strMinAge = JSON.stringify(jsonStudy.MinimumAge[0]);
                const splitMinAge = strMinAge.split(" ");
                const minStrNum = splitMinAge[0].substring(1);
                const numMinAge = Number(minStrNum);

                let objMinAge = await  MinAge.findOne({minAge:numMinAge}).exec();
                if(!objMinAge){
                    objMinAge = new MinAge({
                        minAge: numMinAge
                    })
                    await objMinAge.save();
                }
                console.log(numMinAge);
                pars.minAge = objMinAge;
            }
            if (jsonStudy.MaximumAge[0] != null) {
                const strMaxAge = JSON.stringify(jsonStudy.MaximumAge[0])
                const splitMaxAge = strMaxAge.split(" ");
                const maxStrNum = splitMaxAge[0].substring(1);
                const numMaxAge = Number(maxStrNum);

                let objMaxAge = await MaxAge.findOne({maxAge:numMaxAge}).exec();
                if(!objMaxAge){
                    objMaxAge = new MaxAge({
                        maxAge:numMaxAge
                    })
                    await objMaxAge.save();
                }
                console.log(numMaxAge);
                pars.maxAge = objMaxAge;

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
            console.log("results id",dbStudy.NCTID)
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
    //adding results
    await addResults();
    console.log("resutls added");

    res.redirect('/');
}