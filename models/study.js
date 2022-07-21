const mongoose = require('mongoose');
const fs = require('fs')
const nodeFetch = require('node-fetch');
const xml2js = require('xml2js');

const Schema = mongoose.Schema;
const studySchema = new Schema({

    rank: {
        type: Number,
        required: true
    },
    NCTID: {
        type: String,
        required: true,
        unique: true
    },

    isFDAReg: {
        type: Boolean
    },
    startYear: {
        type: Number
    },
    compYear: {
        type: Number,
    },

    hasResults: {
        type: Boolean
    },
    url: {
        type: String,
    },
})


// read XML from a file
const xml = fs.readFileSync('StudyFields.xml');

// convert XML to JSON

let jsonFields = {};
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
const extras = {};

//const notInclude = ['NCTId','NCTIdAlias'];// add not include vlaues later


for (let i = 0; i < jsonFields.length; i++) {
    const propKey = jsonFields[i].Name[0]
    let unique = false
    // if(propKey =='NCTId'){
    //     unique = true
    // }
    extras[propKey] = {
        type: String,
        unique: unique
    }
}
studySchema.add(extras)
console.log(studySchema)

module.exports = mongoose.model('Study', studySchema)
