
// const Study = require('../models/study')
// const fs = require ('fs');
// const xml2js = require('xml2js');

// const studyFields = getJSONFields();

// function getJSONFields(){
//     let jsonFields = {};
//     const xml = fs.readFileSync('StudyFields.xml'); 
// let json = "";

// xml2js.parseString(xml, { mergeAttrs: true }, (err, result) => {
//     if (err) {
//         throw err;
//     }

//     // `result` is a JavaScript object
//     // convert it to a JSON string
//     const jsonString = JSON.stringify(result, null, 4);
//     fs.writeFileSync('fields.json', jsonString)
//     json = JSON.parse(jsonString);

// }); 
// //array of field names
// jsonFields = json.StudyFields.FieldList[0].Field;

// return jsonFields
// }

// exports.getFindAll = (req,res, next) =>{
//     res.render('findStudies',{
//         fieldsArray: studyFields
//     });
// }

// exports.makeStudies = (req, res, next) =>{
//     console.log(req.body);
//     const keys= Object.keys(req.body)
//     console.log (keys)

//     const study = new Study();

//     for(let i=0; i<keys.length; i++){
//         for(let j=0; j<studyFields.legnth; j++){
//             if(keys[i]==studyFields[j]){

//             }
//         }
      
//     }
//     res.redirect('/');
// }


