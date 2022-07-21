const fs = require('fs');
const fetch = require('node-fetch');

const DuchenneStudy = require('../models/duchenneStudy');
const Location = require('../models/location');

const generalFields = ["NCTId", "OfficialTitle", "BriefSummary", "CollaboratorName", "LeadSponsorName", "DetailedDescription", "EnrollmentCount", "IsFDARegulatedDevice", "IsFDARegulatedDrug", "AvailIPDURL", "BriefTitle", "Condition", "StudyType"];
const stateFields = ["NCTId", "Phase", "OverallStatus", "DesignPrimaryPurpose"]

const locationFields = ["NCTId", "LocationFacility", "LocationCity", "LocationCountry"];
const methodFields = ["NCTId", "DesignInterventionModel", "DesignInterventionModelDescription", "InterventionName", "InterventionType", "InterventionDescription", "DesignAllocation", "PrimaryOutcomeMeasure", "SecondaryOutcomeMeasure", "OutcomeMeasureDescription", "DesignMasking", "FlowMilestoneComment", "OutcomeMeasureType"];
const participantFields = ["NCTId", "Gender", "MinimumAge", "MaximumAge", "HealthyVolunteers"];
const resultFields = ["NCTId", "PrimaryOutcomeDescription", "SecondaryOutcomeDescription", "OtherOutcomeDescription", "WhyStopped", "ResultsFirstPostDate"];
const dateFields = ["NCTId", "StartDate", "CompletionDate"];

const CONDITION = 'Duchenne Muscular Dystrophy';
const KEYWORD = 'Duchenne';
const NUM_STUDIES_GENERATED = 10;

exports.wipeAll = async (req, res, next) => {
    await DuchenneStudy.deleteMany().exec();
    await Location.deleteMany().exec();
    res.redirect('/');
}

function makeJASONfile(data, fileName) {
    const name = fileName + ".json";
    fs.writeFileSync(name, data);
    console.log("JSON data is saved.", fileName);
}

function buildURL(fields) {
    console.log(CONDITION);

    const splitCondition = CONDITION.split(" ");
    const urlStart = "https://clinicaltrials.gov/api/query/study_fields?expr=";
    const urlEnd = "&min_rnk=1&max_rnk=" + NUM_STUDIES_GENERATED + "&fmt=JSON";

    let urlMiddle = "";
    if (splitCondition.length > 1) {
        for (let i = 0; i < splitCondition.length - 1; i++) {
            urlMiddle += splitCondition[i] + "+";
        }
        urlMiddle += splitCondition[splitCondition.length - 1];
    }
    else {
        urlMiddle += CONDITION
    }
    urlMiddle += "&fields=";


    for (let i = 0; i < fields.length - 1; i++) {
        urlMiddle += fields[i] + "%2C";
    }
    urlMiddle += fields[fields.length - 1];

    const URL = urlStart + urlMiddle + urlEnd;

    return URL;
}

exports.buildJSONFiles = async (req, res, next) => {

    console.log("making general file")
    const generalJSON = await fetchJSON(generalFields, CONDITION);
    const generalData = JSON.stringify(generalJSON);
    makeJASONfile(generalData, "studies");

    console.log("making location file")
    const locationJSON = await fetchJSON(locationFields, CONDITION);
    const locData = JSON.stringify(locationJSON);
    makeJASONfile(locData, "locations");
    console.log("location file made");

    console.log("making method file")
    const methodJSON = await fetchJSON(methodFields, CONDITION);
    const methodData = JSON.stringify(methodJSON);
    makeJASONfile(methodData, "methods");

    console.log("making participants file")
    const participantJSON = await fetchJSON(participantFields, CONDITION);
    const parData = JSON.stringify(participantJSON);
    makeJASONfile(parData, "participants");

    console.log("making dates file")
    const datesJSON = await fetchJSON(dateFields, CONDITION);
    const dateData = JSON.stringify(datesJSON);
    makeJASONfile(dateData, "dates");

    console.log("making state files")
    const statJSON = await fetchJSON(stateFields, CONDITION);
    const statData = JSON.stringify(statJSON);
    makeJASONfile(statData, "states");

    console.log("making results files")
    const resultsJSON = await fetchJSON(resultFields, CONDITION);
    const resData = JSON.stringify(resultsJSON);
    makeJASONfile(resData, "resutls");

    res.status(200).end()
}

async function fetchJSON(fields) {
    const url = buildURL(fields);
    const response = await fetch(url);
    const json = await response.json();
    return json;
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
async function makeStudies() {
    try {
        await DuchenneStudy.deleteMany().exec();

        const json = await fetchJSON(generalFields, CONDITION);
        const jsonStudies = json.StudyFieldsResponse.StudyFields;

        const numStudies = jsonStudies.length;

        for (let i = 0; i < numStudies; i++) {
            console.log(i);
            const isFDA = jsonStudies[i].IsFDARegulatedDevice[0] == "Yes" || jsonStudies[i].IsFDARegulatedDrug[0] == "Yes";

            const studyURL = 'https://clinicaltrials.gov/ct2/show/' + jsonStudies[i].NCTId[0];

            if (jsonStudies[i].Condition == CONDITION || jsonStudies[i].Condition[0].includes(KEYWORD)) {
                const study = new DuchenneStudy({
                    rank: jsonStudies[i].Rank,
                    NCTID: jsonStudies[i].NCTId[0],
                    type: jsonStudies[i].StudyType[0],
                    condition: jsonStudies[i].Condition[0],
                    officialTitle: jsonStudies[i].OfficialTitle[0],
                    briefTitle: jsonStudies[i].BriefTitle[0],
                    briefSumarry: jsonStudies[i].BriefSummary[0],
                    detailedDescription: jsonStudies[i].DetailedDescription[0],
                    enrollment: jsonStudies[i].EnrollmentCount[0],
                    isFDAreg: isFDA,
                    collaborators: jsonStudies[i].CollaboratorName[0],
                    leadSponsor: jsonStudies[i].LeadSponsorName[0],
                    url: studyURL
                })
                console.log("study made id", study.NCTID)
                await study.save();
            }

        }
    }
    catch (err) {
        console.log(err)
    }


}

async function addLocations() {
    try {

        await Location.deleteMany().exec();
        const json = await fetchJSON(locationFields, CONDITION);
        const jsonStudies = json.StudyFieldsResponse.StudyFields;

        for (jsonStudy of jsonStudies) {
            const dbStudy = await DuchenneStudy.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
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

        const json = await fetchJSON(methodFields, CONDITION);

        const jsonStudies = json.StudyFieldsResponse.StudyFields;

        for (jsonStudy of jsonStudies) {
            const dbStudy = await DuchenneStudy.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
            if (dbStudy != null) {
                console.log("method id", dbStudy.NCTID)

                //adding method perameters to study
                dbStudy.allocation = jsonStudy.DesignAllocation[0];
                dbStudy.interventionName = jsonStudy.InterventionName[0];
                dbStudy.interventionType = jsonStudy.InterventionType[0];
                dbStudy.interventionModel = jsonStudy.DesignInterventionModel[0];
                dbStudy.interventionModelDescription = jsonStudy.DesignInterventionModelDescription[0]
                dbStudy.primaryOutcomeMeasure = jsonStudy.PrimaryOutcomeMeasure[0];
                dbStudy.secondaryOutcomeMeasure = jsonStudy.SecondaryOutcomeMeasure[0];
                dbStudy.outcomeMeasureDescription = jsonStudy.OutcomeMeasureDescription[0];
                dbStudy.masking = jsonStudy.DesignMasking[0];

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

        const json = await fetchJSON(participantFields, CONDITION);
        const jsonStudies = json.StudyFieldsResponse.StudyFields;

        for (jsonStudy of jsonStudies) {
            const dbStudy = await DuchenneStudy.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
            if (dbStudy != null) {
                console.log("participants study id", dbStudy.NCTID);

                dbStudy.gender = jsonStudy.Gender[0];

                if (jsonStudy.MinimumAge[0] != null) {
                    const strMinAge = JSON.stringify(jsonStudy.MinimumAge[0]);
                    const splitMinAge = strMinAge.split(" ");
                    const minStrNum = splitMinAge[0].substring(1);
                    const numMinAge = Number(minStrNum);

                    console.log(numMinAge);
                    dbStudy.minAge = numMinAge;
                }
                if (jsonStudy.MaximumAge[0] != null) {
                    const strMaxAge = JSON.stringify(jsonStudy.MaximumAge[0])
                    const splitMaxAge = strMaxAge.split(" ");
                    const maxStrNum = splitMaxAge[0].substring(1);
                    const numMaxAge = Number(maxStrNum);

                    console.log(numMaxAge);
                    dbStudy.maxAge = numMaxAge;


                }

                let healthyStr = "";
                if (jsonStudy.HealthyVolunteers.length > 0) {
                    let healthyBool = false;
                    healthyStr = jsonStudy.HealthyVolunteers[0];
                    if (healthyStr == 'Accepts Healthy Volunteers') {
                        healthyBool = true;
                    }

                    dbStudy.acceptsHealthy = healthyBool
                }

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
        const json = await fetchJSON(dateFields, CONDITION);
        const jsonStudies = json.StudyFieldsResponse.StudyFields;

        for (jsonStudy of jsonStudies) {
            const dbStudy = await DuchenneStudy.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
            if (dbStudy != null) {
                console.log("date id", dbStudy.NCTID);

                if (jsonStudy.StartDate[0] != null) {
                    const jsonSDate = jsonStudy.StartDate[0];
                    console.log(jsonSDate);
                    let stringSDate = JSON.stringify(jsonSDate);
                    stringSDate = stringSDate.substring(1, stringSDate.length - 1);
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
                    sYear = sYear.substring(0);

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
                    dbStudy.strSDate = stringSDate;

                }
                if (jsonStudy.CompletionDate[0] != null) {
                    const jsonCDate = jsonStudy.CompletionDate[0];
                    let stringCDate = JSON.stringify(jsonCDate);
                    stringCDate = stringCDate.substring(1, stringCDate.length - 1);
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
                    cYear = cYear.substring(0);

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
                    dbStudy.strCDate = stringCDate;
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

        const json = await fetchJSON(stateFields, CONDITION);
        const jsonStudies = json.StudyFieldsResponse.StudyFields;

        for (jsonStudy of jsonStudies) {
            const dbStudy = await DuchenneStudy.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
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

        const json = await fetchJSON(resultFields, CONDITION);
        const jsonStudies = json.StudyFieldsResponse.StudyFields;

        for (jsonStudy of jsonStudies) {
            const dbStudy = await DuchenneStudy.findOne({ NCTID: jsonStudy.NCTId[0] }).exec();
            if (dbStudy != null) {
                console.log("results id", dbStudy.NCTID)

                if (jsonStudy.ResultsFirstPostDate.length > 0) {
                    console.log('has results')

                    dbStudy.dateRetultsPosted = jsonStudy.ResultsFirstPostDate[0];
                    dbStudy.hasResults = true;
                }
                else {
                    dbStudy.hasResults = false;
                }

                console.log(dbStudy.hasResults);

                dbStudy.primaryOutcomeDescription = jsonStudy.PrimaryOutcomeDescription[0];
                dbStudy.otherOutcomesDescription = jsonStudy.OtherOutcomeDescription[0];
                dbStudy.whyStopped = jsonStudy.WhyStopped[0];
                await dbStudy.save();
            }
        }
    }
    catch (err) {
        console.log(err)
    }
}

exports.test = async (req, res, next) => {
    const json = await fetchJSON(generalFields, CONDITION);
    const jsonStudies = json.StudyFieldsResponse.StudyFields;

    for (jsonStudy of jsonStudies) {
        console.log(jsonStudy.Keyword[0])
    }
    res.redirect('/')
}

exports.run = async (req, res, next) => {
    //making studies
    // await makeStudies();
    // console.log("studies made");
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
