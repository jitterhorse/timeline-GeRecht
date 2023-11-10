var json2 = File($.fileName).path + "/lib/" + "json2.js";
$.evalFile(json2);

//get positions from blueprint and store them
var positions = [];
var scales = [];
var bp_positions = app.project.sequences;
for(var o = 0; o < bp_positions.length; o++){  
    if(bp_positions[o].name === "PositionBlueprint"){
        for(var i = 0; i < bp_positions[o].videoTracks.length; i++){
            // get value x,y - x can be obtained with pos[0]
            var pos = bp_positions[o].videoTracks[i].clips[0].components[1].properties[0].getValue()
            positions.push(pos);
            var scale = bp_positions[o].videoTracks[i].clips[0].components[1].properties[1].getValue()
            scales.push(scale);
            //app.setSDKEventMessage(bp_positions[o].name + " - " + scale,"info");
        }
    }
}

//app.setSDKEventMessage(positions.length.toString(),"info");

var sequence = app.project.activeSequence;
var track = sequence.videoTracks[0];

var csvOutput = ['"scene","image","lw","start","end","duration","info","person1","person2","person3"'];

for(var i = 0; i < sequence.videoTracks.length; i++){
    for(var j = 0; j < sequence.videoTracks[i].clips.length; j++){

        //set position
        sequence.videoTracks[i].clips[j].components[1].properties[0].setValue(positions[i]);
        sequence.videoTracks[i].clips[j].components[1].properties[1].setValue(scales[i]);

        //get values
        var mgt = sequence.videoTracks[i].clips[j].getMGTComponent();
        if(mgt){
            var scene = getTextValue(mgt.properties.getParamForDisplayName("scene"));
            var image = getTextValue(mgt.properties.getParamForDisplayName("image"));
            var info = getTextValue(mgt.properties.getParamForDisplayName("info txt"));
            //info = info.replace(/(\r\n|\n|\r)/gm, "");
            var person1 = getTextValue(mgt.properties.getParamForDisplayName("person1"));
            var person2 = getTextValue(mgt.properties.getParamForDisplayName("person2"));
            var person3 = getTextValue(mgt.properties.getParamForDisplayName("person3"));
            
            // push to array
            csvOutput.push(
                '"'
                + scene 
                + '","'
                + image 
                + '","'
                + sequence.videoTracks[i].name
                + '","'  
                + sequence.videoTracks[i].clips[j].start.seconds
                + '","'
                + sequence.videoTracks[i].clips[j].end.seconds
                + '","'
                + sequence.videoTracks[i].clips[j].duration.seconds
                + '","'
                + info
                + '","'
                + person1
                + '","'
                + person2
                + '","'
                + person3
                + '"'
                );
            sequence.videoTracks[i].clips[j].name = scene + " - " + image;

        }
        /*
        for(var k = 0; k < mgt.properties.numItems; k++){
            //get name of field
            app.setSDKEventMessage(mgt.properties[k].displayName,"info");

            //get text value
            var d = mgt.properties[k].getValue();
            var e = JSON.parse(d);
            app.setSDKEventMessage(e["textEditValue"].toString(),"info");
         
        }
        */
        
    }
}

var scriptFolderPath = File($.fileName).path;
var exportFolderPath = scriptFolderPath + encodeURI("/output"); // the URI of the folder for your script resources    

var CSVresults = csvOutput.join('\r\n');
var csvFile = new File(exportFolderPath + encodeURI("/"+sequence.name.toString()+".csv"));
writeFile(csvFile, CSVresults);

// A function to write the file to the file system.
function writeFile(fileObj, fileContent, encoding) {
    encoding = encoding || "utf-8";
    fileObj = (fileObj instanceof File) ? fileObj : new File(fileObj);
    var parentFolder = fileObj.parent;

    if (!parentFolder.exists && !parentFolder.create()) {
        throw new Error("Cannot create file in path " + fileObj.fsName);
    }

    var BOM = String.fromCharCode(0xFEFF);

    fileObj.encoding = encoding;
    fileObj.open("w");
    fileObj.write(BOM + fileContent);
    fileObj.close();

    return fileObj;
}

function getTextValue(stream){
    //app.setSDKEventMessage(stream.toString(),"info");
    var d = stream.getValue();
    var e = JSON.parse(d);
    var s = e["textEditValue"].toString();
    return s
}