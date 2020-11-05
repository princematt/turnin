
let startsWithDateRegex = /^(\d{1,2}\/\d\d?\/\d{2})/

let startsWithTimePeriodRegex = /^(0?[1-9]|1[012])(:[0-5]\d)(am|pm) - (0?[1-9]|1[012])(:[0-5]\d)(am|pm)/


//parses a file and extract time log stats
function Parser(content) {

    /** number of days spent. Call the parse function before accessing this value */
    this.numOfDaysSpent = 0;

    /** Total time spent in seconds for the parsed task time log */
    this.totalTimeInMilliSeconds = 0;


    this.parse = () => {

        let timeLogsArray = (content || "").split(/[\r\n]+/); //split into new lines...

        if (timeLogsArray.length > 1) {

            let name = timeLogsArray[0]; // first row is the project name.

            timeLogsArray.splice(0, 1);

            let dates = [];

            let totalDurationInMilliSeconds = 0;

            let currentDate = null;

            for (let line of timeLogsArray) {

                //parse individual files.
                line = line.trim();

                let result = parseLine(line);

                currentDate = result.date || currentDate;

                if (result.date) {
                    dates.push(new Date(currentDate));
                }

                totalDurationInMilliSeconds += result.duration;

            }

            this.numOfDaysSpent = dates.length;

            this.totalTimeInMilliSeconds = totalDurationInMilliSeconds;

        }
        
    }



}


/** 
 ----------------------------------------------------
 COLLECTION OF UTILITY FUNCTIONS FOR PARSING LOG FILE
 ----------------------------------------------------
*/


/** Parses a line */
function parseLine(line) {

    let result = { duration: 0, date: null };

    if (startsWithDate(line)) {

        date = Date.parse(getDateStrFromBeginning(line));

        line = (line.replace(startsWithDateRegex, "")).trim();

        line = removeCharacterFromBeginning(":", line);

        result.date = date;

    }

    while (startsWithTimePeriod(line)) {

        let timePeriod = getTimePeriodFromBeginning(line);

        let [start, end] = getStartAndEndSectionFromTimePeriodStr(timePeriod);

        start = parseTimeStringAsDate(start);

        end = parseTimeStringAsDate(end);

        line = (line.replace(startsWithTimePeriodRegex, "")).trim();

        let duration = 0;

        /** End time cannot be less than start time. When this happens, we assume the end time is of the next day. E.g 11:00pm - 12:00am */
        if(end.getTime() < start.getTime()){ 

            end.setDate(end.getDate() + 1);

        }

        duration = end.getTime() - start.getTime();

        result.duration+=duration;

        line = removeCharacterFromBeginning(",",line);

    }

    return result;

}

/** Checks if a string starts with an m/d/yy date format */
function startsWithDate(string) {

    return startsWithDateRegex.test(string);

}

/** Checks if a string starts with a time period pattern. Matches this pattern: 12:20am - 2:30pm */
function startsWithTimePeriod(string) {

    return startsWithTimePeriodRegex.test(string);

}

/** Gets the date str from the beggining of a string. 
 * Looks for an m/d/yy date pattern at the beginning of a string and returns it. */
function getDateStrFromBeginning(string) {

    return startsWithDateRegex.exec(string)[0];

}


/** Gets the time period str from the beggining of a string. 
 * Looks for 12:20am - 2:30pm time pattern at the beginning of a string and returns it. */
function getTimePeriodFromBeginning(string) {

    return startsWithTimePeriodRegex.exec(string)[0];

}


/** Parses time string like 7:30am to a date object (based from current day or the specified base date) */
function parseTimeStringAsDate(s, baseDate) {

    
    let d = baseDate || new Date();

    let sections = s.match(/(\d+)\:(\d+)(\w+)/);


    //do case insensitive search to get am or pm and get the hour value in 24 hours format

    let hours = 0;

    if( /am/i.test(sections[3])){

        hours = parseInt(sections[1]);

        if(hours == 12){

            hours = 0; //12 am is 00 am.

        }

    }

    else{

        if(parseInt(sections[1]) == 12){ //12: pm 

            hours = 12;
        
        }

        else{

            hours = parseInt(sections[1]) + 12

        }

    }

    let minutes = parseInt(sections[2]);

    d.setHours(hours, minutes, 0, 0);

    return d;

}


/**Atempts to remove a character from the beginning of a string */
function removeCharacterFromBeginning(character, string) {

    let result = "";

    if (string.startsWith(character)) {

        let sections = string.split(character);

        sections = sections.slice(1);

        result = sections.join(character).trim();

    }

    return result || string; //return a truthy result or the original string.

}

//parses a time string like 12:30am - 2:00pm into two sections. 
function getStartAndEndSectionFromTimePeriodStr(timePeriod) {

    let section = timePeriod.split(" - ");

    return section;

}
