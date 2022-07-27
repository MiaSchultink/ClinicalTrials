
const fetch = require('node-fetch')
const fs = require('fs');
const converter = require('json-2-csv');

const xml2js = require('xml2js');

const Study = require('../models/study');
const Location = require('../models/location');

const generalFields = ["NCTId", "OfficialTitle", "BriefSummary", "CollaboratorName", "LeadSponsorName", "DetailedDescription", "EnrollmentCount", "IsFDARegulatedDevice", "IsFDARegulatedDrug", "AvailIPDURL", "BriefTitle", "Condition", "StudyType"];
const stateFields = ["NCTId", "Phase", "OverallStatus", "DesignPrimaryPurpose"]

const locationFields = ["NCTId", "LocationFacility", "LocationCity", "LocationCountry"];
const methodFields = ["NCTId", "DesignInterventionModel", "DesignInterventionModelDescription", "InterventionName", "InterventionType", "InterventionDescription", "DesignAllocation", "PrimaryOutcomeMeasure", "SecondaryOutcomeMeasure", "OutcomeMeasureDescription", "DesignMasking", "FlowMilestoneComment", "OutcomeMeasureType"];
const participantFields = ["NCTId", "Gender", "MinimumAge", "MaximumAge", "HealthyVolunteers"];
const resultFields = ["NCTId", "PrimaryOutcomeDescription", "SecondaryOutcomeDescription", "OtherOutcomeDescription", "WhyStopped", "ResultsFirstPostDate"];
const dateFields = ["NCTId", "StartDate", "CompletionDate"];

const additionalFields = ["NCTId"];

const searchFields = ["NCTId", "Phase", "OverallStatus", "DesignPrimaryPurpose", "EnrollmentCount", "IsFDARegulatedDevice", "IsFDARegulatedDrug", "Gender", "MinimumAge", "MaximumAge", "LocationFacility", "LocationCity", "LocationCountry", "StartDate", "CompletionDate", "DesignInterventionModel"]



//constnats and importnat variables
let CONDITION = "Huntington's Disease"
let KEYWORD = 'Huntington';
const NUM_STUDIES_GENERATED = 20;

function makeJASONfile(data, fileName) {
    const name = fileName + ".json";
    fs.writeFileSync(name, data);
    //console.log("JSON data is saved.", fileName);
}

function buildURL(fields) {
    //console.log(CONDITION);

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

async function fetchJSON(fields) {
    const url = buildURL(fields);
    const response = await fetch(url);
    const json = await response.json();
    return json;
}

const studyFields = getJSONFields();
const importantFields = ["OfficialTitle", "BriefSummary", "CollaboratorName", "LeadSponsorName", "DetailedDescription", "EnrollmentCount", "IsFDARegulatedDevice", "IsFDARegulatedDrug", "AvailIPDURL", "BriefTitle", "Condition", "StudyType",
    "Phase", "OverallStatus", "DesignPrimaryPurpose", "LocationFacility", "LocationCity", "LocationCountry", "DesignInterventionModel", "DesignInterventionModelDescription", "InterventionName", "InterventionType", "InterventionDescription", "DesignAllocation", "PrimaryOutcomeMeasure", "SecondaryOutcomeMeasure", "OutcomeMeasureDescription", "DesignMasking", "FlowMilestoneComment", "Gender", "MinimumAge", "MaximumAge", "HealthyVolunteers", "PrimaryOutcomeDescription", "SecondaryOutcomeDescription", "OtherOutcomeDescription", "WhyStopped", "ResultsFirstPostDate",
    "StartDate", "CompletionDate"];

function jsonToCSV(json) {
    converter.json2csv(json, (err, csv) => {
        if (err) {
            console.log(err);
            throw err;
        }
        // print CSV string
        console.log('csv from function', csv);
        return csv;
    });
}

const notIncludes = [];

function getJSONFields() {
    let jsonFields = {};
    const xml = fs.readFileSync('StudyFields.xml');
    let json = "";

    xml2js.parseString(xml, { mergeAttrs: true }, (err, result) => {
        if (err) {
            throw err;
        }
        // `result` is a JavaScript object
        // convert it to a JSON string
        const jsonString = JSON.stringify(result, null, 4);
        fs.writeFileSync('fields.json', jsonString)
        json = JSON.parse(jsonString);

    });
    //array of field names
    jsonFields = json.StudyFields.FieldList[0].Field;

    return jsonFields
}

exports.getFindAll = (req, res, next) => {
    const regularFields = [];
    for(let i=0; i<studyFields.length; i++){
        regularFields[i] = studyFields[i].Name[0];
    }
    res.render('findStudies', {
        fieldsArray: regularFields,
        importantFields: importantFields
    });
}

function getStartDate(jsonSDate) {

    let stringSDate = JSON.stringify(jsonSDate);
    stringSDate = stringSDate.substring(1, stringSDate.length - 1);
    const splitSDate = stringSDate.split(" ");

    let sYear = "";
    if (splitSDate.length == 2) {
        sYear = splitSDate[1];
    }
    else if (splitSDate.length == 3) {
        sYear = splitSDate[2];
    }
    sYear = sYear.substring(0);

    const numSYear = parseInt(sYear);

    return numSYear;
}

function getCompDate(jsonCDate) {
    let stringCDate = JSON.stringify(jsonCDate);
    stringCDate = stringCDate.substring(1, stringCDate.length - 1);
    const splitCDate = stringCDate.split(" ");

    let cYear = "";
    if (splitCDate.length == 2) {
        cYear = splitCDate[1];
    }
    else if (splitCDate.length == 3) {
        cYear = splitCDate[2];
    }
    cYear = cYear.substring(0);

    const numCyear = parseInt(cYear);

    return numCyear;
}

function getFields(keys) {
    const fields = ['Condition', 'NCTId'];
    for (let j = 0; j < keys.length; j++) {
        if (keys[i]!=null && keys[j] != 'keyword' && keys[j] != 'cond' && keys[j] != "_csrf" && keys[j] && keys[j] != "fileType" && keys[j] != 'Condition' && keys[j] != "NCTId") {
            fields.push(keys[j])
        }
    }
    return fields;
}
function getURLFields(fields) {
    const urlFields = ['Condition', 'NCTId'];

    for (let i = 0; i < fields.length; i++) {
        if (keys[i]!=null&& fields[i] != 'Condition' && fields[i] != "NCTId" && fields[i] != "startYear"
            && fields[i] != "compYear" && fields[i] != "url" && fields[i] != "hasRes" && fields[i] != "isFDA") {
            urlFields.push(fields[i])
        }
    }
    if (!fields.includes('IsFDARegulatedDrug')) {
        urlFields.push('IsFDARegulatedDrug')
    }
    if (!fields.includes('IsFDARegulatedDevice')) {
        urlFields.push('IsFDARegulatedDevice')
    }
    if (!fields.includes('ResultsFirstPostDate')) {
        urlFields.push('ResultsFirstPostDate');
    }
    if (!fields.includes('StartDate')) {
        urlFields.push('StartDate');
    }
    if (!fields.includes('CompletionDate')) {
        urlFields.push('CompletionDate')
    }
    return urlFields
}

async function generateStudy(fields, jsonStudy, keyword, condition, study) {
    if (jsonStudy.Condition[0].includes(keyword) || jsonStudy.Condition[0] == condition) {

        for (let i = 0; i < fields.length; i++) {
            const studyField = fields[i];

            if (studyField == 'isFDA' || studyField == 'startYear' || studyField == 'compYear' || studyField == 'hasRes' || studyField == 'url') {

                if (studyField == 'isFDA') {
                    const isFDA = jsonStudy.IsFDARegulatedDevice[0] == "Yes" || jsonStudy.IsFDARegulatedDrug[0] == "Yes";
                    study.isFDAReg = isFDA;
                }
                if (studyField == 'startYear') {
                    if (jsonStudy.StartDate.length > 0) {
                        const jsonSDate = jsonStudy.StartDate[0];

                        const sYear = getStartDate(jsonSDate);
                        study.startYear = sYear
                    }
                }
                if (studyField == 'compYear') {
                    if (jsonStudy.CompletionDate.length > 0) {
                        const jsonCDate = jsonStudy.CompletionDate[0];
                        const cYear = getCompDate(jsonCDate);
                        study.compYear = cYear;
                    }
                }
                if (studyField == 'hasRes') {
                    if (jsonStudy.ResultsFirstPostDate.length > 0) {
                        //console.log('has results')

                        study.hasResults = true;
                    }
                    else {
                        study.hasResults = false;
                    }
                }
                if (studyField == 'url') {
                    const studyURL = 'https://clinicaltrials.gov/ct2/show/' + jsonStudy.NCTId[0];
                    study.url = studyURL;
                }
            }
            else {
                if (jsonStudy[studyField] != null) {
                    study[studyField] = jsonStudy[studyField][0];
                }
            }
        }
        await study.save();

    }
}
async function convertToOtherFormats(format, studies) {
    let path = "";
    const jsonStringStudies = JSON.stringify(studies);
    const jsonStudies = JSON.parse(jsonStringStudies)

    console.log('json studies', jsonStudies);

    if (format == 'json') {
        fs.writeFileSync('public/docs/userStudies.json', jsonStringStudies);

    }
    else if (format == 'csv') {

        converter.json2csv(jsonStudies, (err, csv) => {
            if (err) {
                console.log(err);
                throw err;
            }
            // print CSV string
            console.log('csv from function', csv);
            fs.writeFileSync('public/docs/userStudies.csv', csv);
        });
    }
    else if (format === 'pdf') {
        console.log('no pdf avalible at this time');
    }

    return path;

}

function getDownloadPath(format){
    let path = "";
    if(format=='csv'){
        path = 'public/docs/userStudies.csv';
    }
    else if(format =='json'){
        path = 'public/docs/userStudies.json';
    }
    else if(format=='pdf'){
        path="";
    }
}


exports.generateStudies = async (req, res, next) => {


    async function mStudy(k, jsonStudy, fields, study) {
        //let study = null;
        if (k == 0) {
            study = new Study();
        }
        else {
            study = await Study.findOne({ NCTId: jsonStudy.NCTId[0] }).exec()
        }
        if (study != null) {
            await generateStudy(fields, jsonStudy, KEYWORD, CONDITION, study);
        }
    }

    async function m2Study(jsonStudy, fields, study) {
        await generateStudy(fields, jsonStudy, KEYWORD, CONDITION, study);
    }

    async function loopStudies(k, urlFields) {

        const currentStudyFields = urlFieldsArrays[k];
        //console.log(currentStudyFields.length)
        const currentURLFields = getURLFields(currentStudyFields);
        // console.log(currentURLFields.length);

        const json = await fetchJSON(currentURLFields);
        //console.log(json)
        const jsonStudies = json.StudyFieldsResponse.StudyFields;

        const p = []
        for (jsonStudy of jsonStudies) {
            p.push(mStudy(k, jsonStudy, currentStudyFields))
        }
        await Promise.all(p)

    }
async function awaitJSON(urlFields){
    const json = await fetchJSON(urlFields);
    return json;

}

    await Study.deleteMany().exec();
    const keys = Object.keys(req.body)
    console.log(keys);

    const fields = getFields(keys);
    console.log('length', fields.length)

    const keyword = req.body.keyword;
    const condition = req.body.cond;
    CONDITION = condition;
    KEYWORD = keyword;
    const format = req.body.fileType;

    const increment = 13; //max length is 20 7 possible fields are added to url fields

    if (fields.length > increment) {
        const urlFieldsArrays = [];

        for (let i = 0; i < 100; i += increment) {

            if (i < (fields.length - 1)) {
                const tempURLFields = [];

                for (let j = i; j < (i + increment); j++) {
                    if (j < (fields.length - 1)) {
                        tempURLFields.push(fields[j]);
                    }
                }
                urlFieldsArrays.push(tempURLFields);
            }
        }

        const p1 = []
        for (let k = 0; k < urlFieldsArrays.length; k++) {

            //     const currentStudyFields = urlFieldsArrays[k];
            //     //console.log(currentStudyFields.length)
            //     const currentURLFields = getURLFields(currentStudyFields);
            //     // console.log(currentURLFields.length);

            //     const json = await fetchJSON(currentURLFields);
            //     //console.log(json)
            //     const jsonStudies = json.StudyFieldsResponse.StudyFields;

            //     const p = []
            //     for (jsonStudy of jsonStudies) {
            //         p.push(mStudy(k, jsonStudy, currentStudyFields))
            //     }
            //     await Promise.all(p)
            p1.push(loopStudies(k, urlFieldsArrays));
        }
        await Promise.all(p1);

    }
    else {
        const urlFields = getURLFields(fields);

       const json = await fetchJSON(urlFields);
        const jsonStudies = json.StudyFieldsResponse.StudyFields;

        const p2 = [];
        for (jsonStudy of jsonStudies) {
            //making intial studies
            const study = new Study();
            //await generateStudy(fields, jsonStudy, KEYWORD, CONDITION, study);
            p2.push(m2Study(jsonStudy, fields, study));
        }
        await Promise.all(p2);
    }

    const studies = await Study.find().exec();
    console.log(studies);

  await convertToOtherFormats(format, studies);
    res.redirect('/');
}

exports.downloadData =(req, res, next) =>{
    const path = getDownloadPath(format);
    res.download(path);
    res.redirec('/')
}
