# Clinical Trials API

This is one of my data science projects. This project is an API website that works with the clinicaltrials.gov website (api that stores data about clinlcal trials for countless medical conditions). First data is taken from the databse and filtered by user specified perameter. Then it is further filtered to elimiate irrelevnat studies that may have been generated. 
Eventually the data is conveted to the users prefered format (JSON or CSV). 
And now how all of this actually happens. After getting the data from the server, it is filtered, formatted and organized with Javascript. Then each study is stored 
as a MongoDB record. The MongoDB records are then put into the desired file format.

This project was intended to help a company called Art Biosicnece map out the data in the field of Duchenne Muscular Dystrophy which they are currenly developing treatments for. 
After the first version sucessfully helped them, I decided to expand the project so that the same kind of data mappping can be done for any condition with any perameters.

See lates branch for updates
