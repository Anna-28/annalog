class Project {
	constructor(newName, timelogger) {
		this.name = newName;
		this.timelogger = timelogger;
		//this.allTimelogs = [];
	}
	
	/* addTimelog(newTimelog) {
		this.allTimelogs.push(newTimelog);
	} */
	
	getTimelogs() {
		// projects are only linked to timelogs by name
		// so that the timelogs can change the project that way
		// instead of changing the actual project's name
		let results = [];
		this.timelogger.allTimelogs.forEach((aTimelog) => {
			if( aTimelog.project === this.name ) {
				//console.log('timelog found: ' + aTimelog);
				results.push(aTimelog);
			}
		});
		return results;
	}
	
	getNameNoSpaces() {
		return this.name.replace(/\s+/g, '-');
	}
	
	toString() {
		return `${this.name}`
	}
	
	getDeltaTime() {
		let totalTime = 0;
		let timelogs = this.getTimelogs();
		
		timelogs.forEach((aTimelog) => {
			totalTime += aTimelog.getDeltaTime();
		});
		
		return totalTime;
	}
	
	getIntTime() {
		let totalIntTime = 0;
		let timelogs = this.getTimelogs();
		
		timelogs.forEach((aTimelog) => {
			totalIntTime += aTimelog.intTime;
		});
		
		return totalIntTime;
	}
	
	getStartTime() {
		let startTime = null;
		let timelogs = this.getTimelogs();
		
		startTime = timelogs[0].start;
		timelogs.forEach((aTimelog) => {
			if (aTimelog.start < startTime) {
				startTime = aTimelog.start;
			}
		});
		
		return startTime;
	}
	
	getLastTime() {
		let lastTime = null;
		let timelogs = this.getTimelogs();
		
		// check start times first in case the latest time
		// is a time log that has not finished yet
		lastTime = timelogs[0].start;
		timelogs.forEach((aTimelog) => {
			if (aTimelog.start > lastTime) {
				lastTime = aTimelog.start;
			}
		});
		
		timelogs.forEach((aTimelog) => {
			if (aTimelog.finish > lastTime) {
				lastTime = aTimelog.finish;
			}
		});
		
		return lastTime;
	}
	
}