
window.onload = init


function init() {

    //bind click listner to load file button

    document.getElementById("upload-btn").addEventListener("click", triggerUpload);

    document.getElementById("file-form").addEventListener("change", onFileSelected);


}


function triggerUpload() {

    //manually click on the hidden input file form.

    document.getElementById("file-form").click();

}

function onFileSelected(event) {

    let files = event.target.files;

    if (files) {

        console.log({ files });

        let resultBox = document.getElementById("result-box");

        resultBox.style.display = "block"; // show the result box.

        resultBox.innerHTML = ""; // empty the element.

        //read the content of the file

        for (let file of files) {

            console.log({ file });

            parseFileAndUpdateDOM(file);

        }
    }

}

function parseFileAndUpdateDOM(file) {

    let resultBox = document.getElementById("result-box");

    let fileReader = new FileReader();

    let projectName = file.name.split(".txt")[0];

    // alert(projectName);

    fileReader.onload = () => {

        let parser = new Parser(fileReader.result || "");

        parser.parse();

        console.log("total time spent: ", parser.totalTimeInMilliSeconds);

        console.log("number of days entry: ", parser.numOfDaysSpent);

        let resultRow = createProjectStatsRow(projectName, parser.numOfDaysSpent, parser.totalTimeInMilliSeconds);

        resultBox.appendChild(resultRow);

    };

    fileReader.readAsText(file); //read the selected file as text.

}

/** Create an HTML element that displays information about a project and return it */
function createProjectStatsRow(projectName, daysOnProject, totalTimeSpentInMilliseconds) {

    let projectRowDiv = document.createElement("div");

    projectRowDiv.classList.add("project-row");

    let title = "Days and time spent on project " + projectName;

    let totalTimeSpentString = convertMillsToTimeString(totalTimeSpentInMilliseconds);

    let titleH3 = document.createElement("h3");

    titleH3.classList.add("result-title");

    titleH3.textContent = title;


    let daysOnProjectH4 = document.createElement("h4");

    daysOnProjectH4.textContent = "Days: " + daysOnProject + " days";


    let totalTimeSpentH4 = document.createElement("h4");

    totalTimeSpentH4.textContent = "Total time spent: " + totalTimeSpentString;


    //append the items to the div
    projectRowDiv.appendChild(titleH3)

    projectRowDiv.appendChild(daysOnProjectH4)

    projectRowDiv.appendChild(totalTimeSpentH4);

    return projectRowDiv;

}

/** Converts a millisecond into a readable time string in the format hours:minutes*/
function convertMillsToTimeString(mills){

    let millsToSeconds = mills / 1000;

    let remainingSeconds = millsToSeconds;

    let hours = Math.floor(millsToSeconds / 3600);

    remainingSeconds = millsToSeconds - (hours * 3600)

    let minutes = Math.floor(remainingSeconds / 60);

    return hours + (hours > 1 ? " hours" : " hour") + " and " + minutes + (minutes > 1 ? " minutes" : " minute");

}