
const fetch = require('node-fetch')
const fs = require('fs');
const Study = require('../models/study');
const Location = require('../models/location');
const Method = require('../models/method');
const Participants = require('../models/participants');
const Results = require('../models/results');

const generalFields = ["NCTId", "OfficialTitle", "BriefSummary", "CollaboratorName", "DetailedDescription", "EnrollmentCount", "IsFDARegulatedDevice", "IsFDARegulatedDrug", "AvailIPDURL"];
const stateFields = ["NCTId", "Phase", "OverallStatus", "DesignPrimaryPurpose"]

const locationFields = ["NCTId", "LocationFacility", "LocationCity", "LocationCountry"];
const methodFields = ["NCTId", "DesignInterventionModel", "DesignInterventionModelDescription", "DesignAllocation", "PrimaryOutcomeMeasure","SecondaryOutcomeMeasure", "OutcomeMeasureDescription"];
const participantFields = ["NCTId", "Gender", "MinimumAge", "MaximumAge"];
const resultFields = ["NCTId", "PrimaryOutcomeDescription", "SecondaryOutcomeDescription", "OtherOutcomeDescription", "WhyStopped", "ResultsFirstPostDate"];

const dateFields = ["NCTId", "StartDate", "CompletionDate"]

exports.wipeAll = async (req, res, next) => {
    await Study.deleteMany().exec();
    await Location.deleteMany().exec();
    await Method.deleteMany().exec();
    await Participants.deleteMany().exec();
    res.redirect('/');
}

function monthToIndex(month) {
    let index = 0;
    switch (month) {
        case 'January': {
            index = 0;
        }
        case 'February': {
            index = 1;
        }
        case 'March': {
            index = 2;
        }
        case 'April': {
            index = 3;
        }
        case 'May': {
            index = 4;
        }
        case 'June': {
            index = 5
        }
        case 'July': {
            index = 6;
        }
        case 'August': {
            index = 7;
        }
        case 'September': {
            index = 8;
        }
        case 'October': {
            index = 9;
        }
        case 'November': {
            index = 10;
        }
        case 'December': {
            index = 11;
        }
    }
    return index;
}


function buildURL(fields) {
    const numStudiesToServe = 795;
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

    // console.log("making general file")
    // const generalJSON = await fetchJSON(generalFields);
    // const generalData = JSON.stringify(generalJSON);
    // makeJASONfile(generalData, "studies");

    // console.log("making location file")
    // const locationJSON = await fetchJSON(locationFields);
    // const locData = JSON.stringify(locationJSON);
    // makeJASONfile(locData, "locations");
    // console.log("location file made");

    // console.log("making method file")
    // const methodJSON = await fetchJSON(methodFields);
    // const methodData = JSON.stringify(methodJSON);
    // makeJASONfile(methodData, "methods");

    // console.log("making participants file")
    // const participantJSON = await fetchJSON(participantFields);
    // const parData = JSON.stringify(participantJSON);
    // makeJASONfile(parData, "participants");

    // console.log("making dates file")
    // const datesJSON = await fetchJSON(dateFields);
    // const dateData = JSON.stringify(datesJSON);
    // makeJASONfile(dateData, "dates");

    // console.log("making state files")
    // const statJSON = await fetchJSON(stateFields);
    // const statData = JSON.stringify(statJSON);
    // makeJASONfile(statData, "states");

    console.log("making results files")
    const resultsJSON = await fetchJSON(resultFields);
    const resData = JSON.stringify(resultsJSON);
    makeJASONfile(resData, "resutls");

    res.status(200).end()
}

async function makeStudies() {
    try {
        await Study.deleteMany().exec();

        const json = await fetchJSON(generalFields);
        const jsonStudies = json.StudyFieldsResponse.StudyFields;

        const numStudies = jsonStudies.length;

        for (let i = 0; i < numStudies; i++) {
            console.log(i);
            const isFDA = jsonStudies[i].IsFDARegulatedDevice[0] == "Yes" || jsonStudies[i].IsFDARegulatedDrug[0] == "Yes";

            const studyURL = 'https://clinicaltrials.gov/ct2/show/' + jsonStudies[i].NCTId[0];



            const study = new Study({
                rank: jsonStudies[i].Rank,
                NCTID: jsonStudies[i].NCTId[0],
                officialTitle: jsonStudies[i].OfficialTitle[0],
                briefSumarry: jsonStudies[i].BriefSummary[0],
                detailedDescription: jsonStudies[i].DetailedDescription[0],
                enrollment: jsonStudies[i].EnrollmentCount[0],
                isFDAreg: isFDA,
                creators: jsonStudies[i].CollaboratorName[0],
                url: studyURL
            })
            console.log("study made id", study.NCTID)
            await study.save();
        }
    }
    catch (err) {
        console.log(err)
    }


}

async function addLocations() {
    console.log('addLocations')
    try {


        await Location.deleteMany().exec();
        const json = await fetchJSON(locationFields);
        const jsonStudies = json.StudyFieldsResponse.StudyFields;

        for (jsonStudy of jsonStudies) {
            const dbStudy = await Study.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
            if (dbStudy != null) {
                console.log("location id", dbStudy.NCTID)

                let loc = null;
                if (jsonStudy.LocationFacility != null) {
                    loc = await Location.findOne({ facility: jsonStudy.LocationFacility[0] }).exec();
                    if (!loc) {
                        loc = new Location({
                            country: jsonStudy.LocationCountry[0],
                            city: jsonStudy.LocationCity[0],
                            facility: jsonStudy.LocationFacility[0]
                        })
                        //console.log(loc);
                        await loc.save();
                    }
                }


                //code added for convience
                dbStudy.country = loc.country;
                dbStudy.city = loc.city;
                dbStudy.studyFacility = loc.facility;

                dbStudy.location = loc._id;
                await dbStudy.save();
            }
        }
    }
    catch (err) {
        console.log(err)
    }

}

async function addMethods() {
    try {


        await Method.deleteMany().exec();

        const json = await fetchJSON(methodFields);

        const jsonStudies = json.StudyFieldsResponse.StudyFields;

        for (jsonStudy of jsonStudies) {
            const dbStudy = await Study.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
            if (dbStudy != null) {
                console.log("method id", dbStudy.NCTID)

                let alloc = "";
                if (jsonStudy.DesignAllocation = !null) {
                    alloc = jsonStudy.DesignAllocation[0];
                }
                let interModel = "";
                if (jsonStudy.DesignInterventionModel != null) {
                    interModel = jsonStudy.DesignInterventionModel[0];
                }
                let pOutcomeMeasure = "";
                if (jsonStudy.PrimaryOutcomeMeasure != null) {
                    pOutcomeMeasure = jsonStudy.PrimaryOutcomeMeasure[0];
                }
                let sOutcomeMeasure = "";
                if(jsonStudy.SecondaryOutcomeMeasure != null){
                    sOutcomeMeasure = jsonStudy.SecondaryOutcomeMeasur[0];
                }
                let OMDescription = "";
                if (jsonStudy.OutcomeMeasureDescription != null) {
                    OMDescription = jsonStudy.OutcomeMeasureDescription[0];
                }

                const method = new Method({
                    allocation: alloc,
                    interventionModel: interModel,
                    primaryOutcomeMeasure: pOutcomeMeasure,
                    secondaryOutcomeMeasure:sOutcomeMeasure,
                    outcomeMeasureDescription: OMDescription
                })
                await method.save();
                dbStudy.method = method._id;

                //code added for convenience
                dbStudy.allocation = method.allocation;
                dbStudy.interventionModel = method.interventionModel;
                dbStudy.primaryOutcomeDescription = method.primaryOutcomeDescription;
                dbStudy.secondaryOutcomeMeasure = method.secondaryOutcomeMeasure;
                dbStudy.outcomeMeasureDescription = method.outcomeMeasureDescription

                await dbStudy.save();

            }
        }
    }
    catch (err) {
        console.log(err)
    }
}

async function addParticipatns() {
    try {


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
                //code added for convenience
                dbStudy.gender = jsonStudy.Gender[0];

                if (jsonStudy.MinimumAge[0] != null) {
                    const strMinAge = JSON.stringify(jsonStudy.MinimumAge[0]);
                    const splitMinAge = strMinAge.split(" ");
                    const minStrNum = splitMinAge[0].substring(1);
                    const numMinAge = Number(minStrNum);

                    console.log(numMinAge);
                    pars.minAge = numMinAge

                    //code added for convenience
                    dbStudy.minAge = numMinAge;
                }
                if (jsonStudy.MaximumAge[0] != null) {
                    const strMaxAge = JSON.stringify(jsonStudy.MaximumAge[0])
                    const splitMaxAge = strMaxAge.split(" ");
                    const maxStrNum = splitMaxAge[0].substring(1);
                    const numMaxAge = Number(maxStrNum);

                    console.log(numMaxAge);
                    pars.maxAge = numMaxAge;

                    //code added for convenience
                    dbStudy.maxAge = numMaxAge;


                }
                await pars.save();
                dbStudy.participants = pars._id;
                await dbStudy.save();
            }
        }
    }
    catch (err) {
        console.log(err)
    }

}

async function addDates() {
    try {
        const json = await fetchJSON(dateFields);
        const jsonStudies = json.StudyFieldsResponse.StudyFields;

        for (jsonStudy of jsonStudies) {
            const dbStudy = await Study.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
            if (dbStudy != null) {
                console.log("date id", dbStudy.NCTID);

                if (jsonStudy.StartDate[0] != null) {
                    const jsonSDate = jsonStudy.StartDate[0];
                    console.log(jsonSDate);
                    let stringSDate = JSON.stringify(jsonSDate);
                    stringSDate = stringSDate.substring(1);
                    const splitSDate = stringSDate.split(" ");

                    let sYear = "";
                    let sDay = "";
                    if (splitSDate.length == 2) {
                        sYear = splitSDate[1];
                    }
                    else if (splitSDate.length == 3) {
                        sDay = splitSDate[1];
                        sYear = splitSDate[2];
                    }
                    const sMonthStr = splitSDate[0];
                    const sMonthIndex = monthToIndex(sMonthStr);
                    sDay = sDay.substring(0, sDay.length - 1)
                    sYear = sYear.substring(0, sYear.length - 1);

                    const startD = new Date(sYear + '/' + sMonthIndex + '/' + sDay);
                    dbStudy.startDate = startD;

                    //convertions to numbers
                    const numSYear = parseInt(sYear);

                    let numSDay = 0;
                    if (sDay != "") {
                        numSDay = parseInt(sDay);
                    }


                    //code added for convenience
                    dbStudy.startYear = numSYear;
                    dbStudy.startMonth = sMonthStr;
                    dbStudy.startDay = numSDay;

                }
                if (jsonStudy.CompletionDate[0] != null) {
                    const jsonCDate = jsonStudy.CompletionDate[0];
                    let stringCDate = JSON.stringify(jsonCDate);
                    stringSDate = stringCDate.substring(1);
                    const splitCDate = stringCDate.split(" ");

                    let cYear = "";
                    let cDay = "";
                    if (splitCDate.length == 2) {
                        cYear = splitCDate[1];
                    }
                    else if (splitCDate.length == 3) {
                        cDay = splitCDate[1];
                        cYear = splitCDate[2];
                    }
                    const cMonthStr = splitCDate[0].substring(1);
                    const cMonthIndex = monthToIndex(cMonthStr);
                    cDay = cDay.substring(0, cDay.length - 1)
                    cYear = cYear.substring(0, cYear.length - 1);

                    console.log(cDay, cMonthIndex, cYear);

                    const compD = new Date(cYear, cMonthIndex, cDay);

                    //making dates into number
                    const numCyear = parseInt(cYear);

                    let numCDay = 0;
                    if (cDay != "") {
                        numCDay = parseInt(cDay);
                    }

                    dbStudy.compDate = compD;
                    //code added for convenience
                    dbStudy.compYear = numCyear;
                    dbStudy.compMonth = cMonthStr;
                    dbStudy.compDay = numCDay;
                }
                await dbStudy.save();
            }

        }

    }
    catch (err) {
        console.log(err)
    }
}

async function addStates() {
    try {

        const json = await fetchJSON(stateFields);
        const jsonStudies = json.StudyFieldsResponse.StudyFields;

        for (jsonStudy of jsonStudies) {
            const dbStudy = await Study.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
            if (dbStudy != null) {
                console.log('state id', dbStudy.NCTID);

                let studyPhase = "";
                if (jsonStudy.Phase[0] != null) {

                    for (let i = 0; i < jsonStudy.Phase.length; i++) {
                        studyPhase = jsonStudy.Phase[i];
                        if (studyPhase != 'Not Applicable') {
                            console.log(studyPhase)
                            studyPhase = studyPhase.match(/(\d+)/)[0];
                        }
                        else {
                            studyPhase = 'Not Applicable'
                        }
                    }
                    // studyPhase = jsonStudy.Phase[0]; 
                    // if (studyPhase != 'Not Applicable') {
                    //     console.log(studyPhase)
                    //     studyPhase = studyPhase.match(/(\d+)/)[0];
                    // }
                }

                dbStudy.phase = studyPhase;
                dbStudy.status = jsonStudy.OverallStatus[0];
                dbStudy.purpose = jsonStudy.DesignPrimaryPurpose[0];

                await dbStudy.save();
            }


        }
    }
    catch (err) {
        console.log(err)
    }

}


async function addResults() {
    try {
        await Results.deleteMany().exec();
        const json = await fetchJSON(resultFields);
        const jsonStudies = json.StudyFieldsResponse.StudyFields;

        for (jsonStudy of jsonStudies) {
            const dbStudy = await Study.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
            if (dbStudy != null) {
                console.log("results id", dbStudy.NCTID)
                const result = new Results({
                    primaryOutcomeDescription: jsonStudy.PrimaryOutcomeDescription[0],
                    otherOutcomesDescription: jsonStudy.OtherOutcomeDescription[0],
                    whyStopped: jsonStudy.WhyStopped[0]
                })
                if(jsonStudy.ResultsFirstPostDate[0].length>0){
                    result.resultsFirstPostedDate = jsonStudy.ResultsFirstPostDate[0];
                    result.hasResults = true;

                    //code added for convenience
                    dbStudy.dateRetultsPosted = jsonStudy.ResultsFirstPostDate[0];
                    dbStudy.hasResults = true;
                }
        
                await result.save();
                dbStudy.results = result._id

                //code added for convenience
                dbStudy.primaryOutcomeDescription = result.primaryOutcomeDescription;
                dbStudy.otherOutcomesDescription = result.otherOutcomesDescription;
                dbStudy.whyStopped = result.whyStopped;
                await dbStudy.save();
            }
        }
    }
    catch (err) {
        console.log(err)
    }
}


///doesnt work yet becuase response redirects
exports.run = async (req, res, next) => {
    //making studies
    // await makeStudies();
    // console.log("studies made");
    // //adding locations
    // await addLocations();
    // console.log("locations added");
    // //adding methods
    // await addMethods();
    // console.log("methods added")
    // //adding participants
    // await addParticipatns();
    // console.log('participants added')
    // //adding study dates
    // await addDates();
    // console.log('dates added');
    // //adding state of study
    // await addStates();
    // console.log('states added')
    //adding results
    await addResults();
    console.log("resutls added");
    res.redirect('/');
}