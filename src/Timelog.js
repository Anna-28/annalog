class Timelog {
	constructor(projectName, newPhase, newDate, newStart, newIntTime, newFinish, newNotes, newId, timelogger) {
		this.project = projectName
		this.phase = newPhase;
		// start date required always
		this.start = new Date(newStart);
		if ( newDate != null ) {
			this.date = new Date(newDate);
		} else {
			// use start as date if none is given
			this.date = new Date(newStart);
		}
		if ( newIntTime != null ) {
			// fix to 2 decimal places so it is easier to edit
			// second parse needed because of .toFixed returning a string
			this.intTime = parseFloat(parseFloat(newIntTime).toFixed(2))
		} else {
			this.intTime = 0;
		}
		// finish date optional, check if given
		if ( newFinish != null ) {
			this.finish = new Date(newFinish);
		} else {
			this.finish = null;
		}
		// auto create ids so we can delete this by id
		this.notes = newNotes;
		this.id = newId
		this.timelogger = timelogger;
	}
	
	toString() {
		// don't include id, incase already existing timelogs have those ids
		
		// finish can be optional
		let finish = null;
		if ( this.finish != null ) {
			finish = this.finish.getTime();
		}
		
		return `${this.project},${this.phase},${this.date.getTime()},${this.start.getTime()},${this.intTime},${finish},${this.showNotes()}`;
	}
	
	showNotes() {
		if ( this.notes != null && this.notes != undefined && this.notes != "" ) {
			// convert newlines to newline strings so that it doesn't create extra lines in the saved file
			//console.log('notes newlines replaced')
			let result = this.notes.replace(/\n+/g, '\\n').trim();
			// escape commas so it does not split by ones used in the notes
			result = result.replace(/,/g, '\\,');
			return result;
		} else {
			//console.log('notes replaced with null')
			return null;
		}
	}
	
	getDeltaTime() {
		if ( this.start == null || this.finish == null ) {
			return null;
		}
		return (this.finish - this.start) / 60000 - this.intTime
	}
	
	
	getStartTime() {
		let hours, hourstring, minutes, minutestring;
		if ( this.start == null ) {
			return null;
		}
		hours = this.start.getHours();
		if ( hours < 10 ) {
			// one digit, add a 0 infront to display it correctly
			hourstring = `0${hours}`;
		} else {
			hourstring = `${hours}`;
		}
		
		minutes = this.start.getMinutes();
		if ( minutes < 10 ) {
			// one digit, add a 0 infront to display it correctly
			minutestring = `0${minutes}`;
		} else {
			minutestring = `${minutes}`;
		}
		
		return `${hourstring}:${minutestring}`
	}
	
	getFinishTime() {
		let hours, hourstring, minutes, minutestring;
		if ( this.finish == null ) {
			return null;
		}
		hours = this.finish.getHours();
		if ( hours < 10 ) {
			// one digit, add a 0 infront to display it correctly
			hourstring = `0${hours}`;
		} else {
			hourstring = `${hours}`;
		}
		
		minutes = this.finish.getMinutes();
		if ( minutes < 10 ) {
			// one digit, add a 0 infront to display it correctly
			minutestring = `0${minutes}`;
		} else {
			minutestring = `${minutes}`;
		}
		
		return `${hourstring}:${minutestring}`
	}
	
}