class Timelogger {
    constructor() {
        this.allTimelogs = [];
		this.allBackupTimelogs = [];
		this.allProjects = [];
		this.lastId = 0;
		this.recording = null;
		this.recordinginfo = {
			mode: null,
			lastpause: null,
		};
		//this.addTimelog("Test", "A", "2017-10-28", "15:00", 20, "13:28")
		//this.addTimelog('Project 1','Development','Tue Nov 28 2017 00:00:00 GMT+1300 (New Zealand Daylight Time)','Tue Nov 28 2017 01:00:00 GMT+1300 (New Zealand Daylight Time)',2,'Tue Nov 28 2017 01:04:00 GMT+1300 (New Zealand Daylight Time)')
	}

    addProject(newName) {
        let newProduct = new Product(newName);
        this.allProjects.push(newProject);
    }

    addTimelog(projectName, newPhase, newDate, newStart, newIntTime, newFinish, newNotes) {
        // find project or make it if not exists
		let project = this.findProject(projectName);
		if ( project == null ) {
			// create a new project if it doesn't exist
			project = new Project(projectName, this);
			this.allProjects.push(project);
		}
		
		// create timelog
		this.lastId = this.lastId + 1;
		let newTimelog = new Timelog(projectName, newPhase, newDate, newStart, newIntTime, newFinish, newNotes, this.lastId, this);
        this.allTimelogs.push(newTimelog);
		
		// add to project
		//project.addTimelog(newTimelog);
		
		//console.log(newTimelog);
		
		this.updateStorage();
    }
	
	recordTimelogWithValues(mode, projectName, newPhase, newNotes) {
		// start recording a time log with existing values
		if ( mode == "start" ) {
			this.lastId = this.lastId + 1;
			// make a new timelog 
			let recording = new Timelog(projectName, newPhase, new Date(), new Date(), 0, null, newNotes, this.lastId, this);
			this.allTimelogs.push(recording);
			this.recording = recording;
			// disable start button so it can't be used again until this recording is done
			document.getElementById("startbtn").className = "btn btn-success btn-lg disabled";
			// remove disabled class from pause and stop buttons
			document.getElementById("pausebtn").className = "btn btn-warning btn-lg";
			document.getElementById("stopbtn").className = "btn btn-danger btn-lg";
			this.recordinginfo.mode = 'unpaused';
			this.updateStorage();
		} else {
			this.recordTimelog(mode);
		}
	}
	
	recordTimelog(mode) {
		if ( mode == "start" ) {
			this.lastId = this.lastId + 1;
			// make a new timelog 
			let recording = new Timelog(null, null, new Date(), new Date(), 0, null, null, this.lastId, this);
			this.allTimelogs.push(recording);
			this.recording = recording;
			// disable start button so it can't be used again until this recording is done
			document.getElementById("startbtn").className = "btn btn-success btn-lg disabled";
			// remove disabled class from pause and stop buttons
			document.getElementById("pausebtn").className = "btn btn-warning btn-lg";
			document.getElementById("stopbtn").className = "btn btn-danger btn-lg";
			this.recordinginfo.mode = 'unpaused';
		} else if ( mode == "pause" ) {
			let pauseicon = "<span class=\"glyphicon glyphicon-pause\"></span>"
			if ( this.recordinginfo.mode == 'unpaused' ) {
				// it is unpaused, so pause the recording
				
				// set current time as last paused time
				this.recordinginfo.lastpause = new Date();
				
				// change button text
				document.getElementById("pausebtn").innerHTML = `${pauseicon} Unpause`;
				this.recordinginfo.mode = 'paused';
			} else if ( this.recordinginfo.mode == 'paused' ) {
				// calculate the amount of minutes between now and the time it was paused
				let intTime = (new Date() - this.recordinginfo.lastpause) / 60000;
				// keep to just two decimal places so it is easier for the user to edit the intTime
				intTime = parseFloat(intTime.toFixed(2));
				//console.log(intTime + ' minutes');
				
				// add this time to the interrupt time
				this.recording.intTime = this.recording.intTime + intTime;
				
				// reset pause time
				this.recordinginfo.lastpause = null;
				
				// change button text
				document.getElementById("pausebtn").innerHTML = `${pauseicon} Pause`;
				this.recordinginfo.mode = 'unpaused';
			}
		} else if ( mode == "stop" ) {
			
			// unpause if paused
			if ( this.recordinginfo.mode == 'paused' ) {
				this.recordTimelog("pause");
			}
			
			this.recording.finish = new Date();
			
			
			// reset recording values
			this.recording = null;
			this.recordinginfo = {
				mode: null,
				lastpause: null,
			};
			
			// enable start button
			document.getElementById("startbtn").className = "btn btn-success btn-lg";
			// disable pause and stop buttons
			document.getElementById("pausebtn").className = "btn btn-warning btn-lg disabled";
			document.getElementById("stopbtn").className = "btn btn-danger btn-lg disabled";
		}
		
		this.updateStorage();
	}
	
	backupTimelog(id) {
		// backup a time log to another array so that it can be restored
		// used when people cancel edits
		let timelog = this.findTimelog(id);
		
		// create a copy of it so that when the original is modified, the copy isn't
		let backup = new Timelog(timelog.project, timelog.phase, timelog.date, timelog.start, timelog.intTime, timelog.finish, timelog.notes, timelog.id, timelog.timelogger)
		
		// remove any existing backups with this id
		this.removeBackupTimelog(id)
		// add to backup array
		this.allBackupTimelogs.push(backup);
		//console.log(backup);
	}
	
	removeBackupTimelog(id) {
		// remove backups after a timelog has been updated
		//console.log(this.allBackupTimelogs)
		for(var i = this.allBackupTimelogs.length - 1; i >= 0; i--) {
			if(this.allBackupTimelogs[i].id === id) {
				// check if the project changed to a new project
				//let backup = this.allBackupTimelogs[i];
				let currentTimelog = this.findTimelog(id);
				
				let project = this.findProject(currentTimelog.project);
				if ( project == null ) {
					// this project isn't recorded already, add it
					let newProject = new Project(currentTimelog.project, this);
					this.allProjects.push(newProject);
				}
				
				// remove the backup
				this.allBackupTimelogs.splice(i, 1);
				break
			}
		}
		//console.log(this.allBackupTimelogs);
		
		// this means the changes were not cancelled, so update storage
		this.updateStorage();
	}
	
	restoreTimelog(id) {
		let timelog = null;
		//console.log(this.allBackupTimelogs)
		// find backup with same id
		this.allBackupTimelogs.forEach((aTimelog) => {
			if( aTimelog.id === id ) {
				timelog = aTimelog;
			}
		});
		
		if ( timelog != null ) {
			// find location in array of current timelog
			for(var i = this.allTimelogs.length - 1; i >= 0; i--) {
				if(this.allTimelogs[i].id === id) {
					// replace with backup
					//console.log('Replacing:');
					//console.log(this.allTimelogs[i]);
					//console.log('With:');
					//console.log(timelog);
					this.allTimelogs[i] = timelog;
					this.fixBackground();
					this.removeBackupTimelog(id);
					break
				}
			}
		} else {
			console.log('Warning, no backup timelog found for timelog with id: ' + id);
		}
		
		this.updateStorage();
		
	}
	
	removeTimelog(id) {
		/* var i = this.allTimelogs.indexOf(name);
		this.allTimelogs.splice(i, 1); */
		for(var i = this.allTimelogs.length - 1; i >= 0; i--) {
			if(this.allTimelogs[i].id === id) {
				//console.log('Removing time log:');
				//console.log(this.allTimelogs[i]);
				if ( this.recording != null && this.recording.id == id ) {
					// if this is the recording timelog, stop it before removing
					this.recordTimelog("stop");
				}
				
				let projectName = this.allTimelogs[i].project;
				
				// remove timelog
				this.allTimelogs.splice(i, 1);
				//console.log(projectName);
				// check if the project for this timelog has no other projects
				let project = this.findProject(projectName);
				//console.log(project);
				if ( project != null ) {
					let timelogs = project.getTimelogs();
					//console.log(timelogs);
					if ( timelogs.length == 0 ) {
						//console.log('project with no time logs found');
						// this project is empty, remove it
						this.removeProject(projectName);
					}
				}
				
				break
			}
		}
		
		this.updateStorage();
		
	}
	
	removeProject(name) {
		for(var i = this.allProjects.length - 1; i >= 0; i--) {
			if(this.allProjects[i].name === name) {
				//console.log('removing project:');
				//console.log(this.allProjects[i]);
				this.allProjects.splice(i, 1);
				break
			}
		}
		
		this.updateStorage();
	}
	
	removeTimelogsFromProject(name) {
		let newTimelogs = [];
		this.allTimelogs.forEach((aTimelog) => {
			if(aTimelog.project != name) {
				newTimelogs.push(aTimelog);
			} else {
				if ( this.recording != null && this.recording.id == aTimelog.id ) {
					// if this is the recording timelog, stop it before removing
					this.recordTimelog("stop");
				}
			}
		});
		
		this.allTimelogs = newTimelogs;
		
		this.removeProject(name);
		
		this.updateStorage();
		
		this.fixBackground();
		
	}
	
	clearTimelogs() {
		// stop the current recording first
		if ( this.recording != null) {
			this.recordTimelog("stop");
		}
		
		// clear all time logs
        this.allTimelogs = [];
		this.allBackupTimelogs = [];
		this.allProjects = [];
		this.lastId = 0;
		this.recording = null;
		this.recordinginfo = {
			mode: null,
			lastpause: null,
		};
		
		// clear storage
		this.clearStorage();
		
		this.fixBackground();
	}
	
	finishTimelog(id) {
		if ( this.recording != null && this.recording.id == id ) {
			// if this is the recording timelog, use that function to finish it
			this.recordTimelog("stop");
		} else {
			let timelog = this.findTimelog(id);
			// this will set the finish time for the timelog to the current time
			timelog.finish = new Date();
		}
		
		this.updateStorage();
	}
	
	findTimelog(id) {
		let result = null;
		this.allTimelogs.forEach((aTimelog) => {
			if( aTimelog.id === id ) {
				//console.log('timelog found: ' + aTimelog);
				result = aTimelog;
			}
		});
		return result;
	}
	
	findProject(name) {
		let result = null;
		this.allProjects.forEach((aProject) => {
			if( aProject.name === name ) {
				result = aProject;
			}
		});
		return result;
	}
	
	findTimelogsInProject(name) {
		let projectTimelogs = [];
		this.allTimelogs.forEach((aTimelog) => {
			if(aTimelog.project === name) {
				projectTimelogs.push(aTimelog);
			}
		});
		
		return projectTimelogs;
	}
	
	updateProjectName(oldName, newName) {
		if (oldName != newName) {
			let project = this.findProject(oldName);
			
			if (project != null) {
				let timelogs = this.findTimelogsInProject(oldName);
				timelogs.forEach((aTimelog) => {
					aTimelog.project = newName;
				});
				
				project.name = newName;
				
				this.updateStorage();
			}
		}
	}
	
	checkTimelogs() {
		// return true or false depending if there are any current Timelogs
		
		if ( this.allTimelogs.length == 0 ) {
			return false
		} else {
			return true
		}
		
	}
	
	getTotalIntTime() {
		let total = 0;
		this.allTimelogs.forEach((aTimelog) => {
			if ( aTimelog.intTime != null ) {
				total = total + aTimelog.intTime;
				//console.log('+' + aTimelog.intTime + ' =' + total); 
			}
		});
		//console.log('Done: ' + total);
		return total;
	}
	
	getAverageIntTime() {
		let total = this.getTotalIntTime();
		let count = this.allTimelogs.length;
		if ( total == 0 || count == 0 ) {
			return 0;
		}
		let average = total / count;
		return average;
	}
	
	getTotalDeltaTime() {
		let total = 0;
		this.allTimelogs.forEach((aTimelog) => {
			if ( aTimelog.getDeltaTime() != null ) {
				total = total + aTimelog.getDeltaTime();
				//console.log('+' + aTimelog.getDeltaTime() + ' =' + total); 
			}
		});
		//console.log('Done: ' + total);
		return total;
	}
	
	getAverageDeltaTime() {
		let total = this.getTotalDeltaTime();
		let count = this.allTimelogs.length;
		if ( total == 0 || count == 0 ) {
			return 0;
		}
		let average = total / count;
		return average;
	}
	
	getCorrelationCoefficient() {
		let interrupttimes = "";
		let deltatimes = "";
		
		let total = 0;
		// n
		let count = this.allTimelogs.length;
		let avgIntTime = this.getAverageIntTime();
		let avgDeltaTime = this.getAverageDeltaTime();
		// Sum(x)
		let totalIntTime = this.getTotalIntTime()
		// Sum(y)
		let totalDeltaTime = this.getTotalDeltaTime()
		
		let combinedtotal = 0;
		let totalIntSqrd = 0;
		let totalDeltaSqrd = 0;
		
		this.allTimelogs.forEach((aTimelog) => {
			//if ( aTimelog.intTime == null || aTimelog.getDeltaTime() == null ) {
			interrupttimes += `${aTimelog.intTime},`
			deltatimes += `${aTimelog.getDeltaTime()},`
			// get the covariance for each Timelog
			
			// get covariance of salary and yearcommenced
			// cov(x,y) = E[(X-E[X])(Y-E[Y])]
			//   E[X] = mean (average) of X
			
			// xy
			combinedtotal += (aTimelog.intTime*aTimelog.getDeltaTime());
			
			// Sum(x^2)
			totalIntSqrd += Math.pow(aTimelog.intTime,2);
			// Sum(y^2)
			totalDeltaSqrd += Math.pow(aTimelog.getDeltaTime(),2);
			
			
			//let covariance = (aTimelog.intTime - avgIntTime)*(aTimelog.getDeltaTime() - avgDeltaTime);
			//console.log(covariance);
			//total += covariance;
		});
		/* //console.log("IntTimes: " + interrupttimes);
		console.log("Average IntTime: " + avgIntTime);
		console.log("Total IntTime: " + totalIntTime);
		//console.log("DeltaTimes: " + deltatimes);
		console.log("Average DeltaTime: " + avgDeltaTime);
		console.log("Total DeltaTime: " + totalDeltaTime);
		console.log("Squared IntTimes: " + totalIntSqrd);
		console.log("Squared DeltaTimes: " + totalDeltaSqrd); */
		
		
		
		let toprow = count*combinedtotal - (totalIntTime*totalDeltaTime);
		//console.log('toprow: ' + toprow);
		let bottomrow = (count*totalIntSqrd - Math.pow(totalIntTime,2))*(count*totalDeltaSqrd - Math.pow(totalDeltaTime,2))
		bottomrow = Math.sqrt(bottomrow);
		//console.log('bottomrow: ' + bottomrow);
		//covariance = (count*combinedtotal - (totalIntTime*totalDeltaTime))/(Math.sqrt((count*totalIntSqrd-Math.pow(totalIntTime,2))(count*totalDeltaSqrd-Math.pow(totalDeltaTime,2))))
		let covariance;
		if ( toprow == 0 && bottomrow == 0 ) {
			covariance = 1;
		} else {
			covariance = toprow / bottomrow
		}
		//let combinedaverage = combinedtotal / count;
		
		// find average covariance
		//let averageCovariance = total / count;
		//console.log(covariance)
		return covariance;
	}
	
	fixBackground() {
		// this is needed because once a timelog is removed or updated, the dialog box for it is too
		// which means that bootstrap doesn't remove the "modal-backdrop fade in" background etc
		document.getElementById("body").className = "ng-scope";
		document.getElementById("body").style = "";
		
		const elements = document.getElementsByClassName("modal-backdrop fade in");
		while (elements.length > 0) elements[0].remove();
	}
	
	sortTimelogs() {
		this.allTimelogs.sort((a, b) => {
			// should probably order by date
            if (a.project < b.project) {
                return -1;
            }
            if (a.lastName > b.lastName) {
                return 1;
            } 
            // if project is the same then order by phase
			if (a.phase < b.phase) {
                return -1;
            }
            if (a.phase > b.phase) {
                return 1;
            } 
            return 0;
        });
	}
	
	updateStorage() {
		let fileText = '';
		
		let storageTimelogs = [];
		
		this.allTimelogs.forEach((aTimelog) => {
			let storageText = `${fileText}${aTimelog}`
			storageTimelogs.push(storageText);
		});
		localStorage.setItem('timelogs', JSON.stringify(storageTimelogs));
	}
	
	clearStorage() {
		localStorage.removeItem('timelogs');
	}
	
	saveTimelogsToFile(projects) {
		let fileText = '';
		let newline = '\r\n';
		let fileName = 'Timelogs'
		
		if ( projects == 'all' ) {
			// add all time logs
			this.allTimelogs.forEach((aTimelog) => {
				// add timelog info on each line
				//console.log(aTimelog);
				//console.log(`${aTimelog}`);
				fileText = `${fileText}${aTimelog}${newline}`
				
			});
		} else {
			// it isn't all projects, get the timelogs per project
			projects.forEach((projectName) => {
				// these are just the project names, we still have to find the actual project
				let aProject = this.findProject(projectName);
				if ( aProject != null ) {
					//console.log(aProject);
					let timelogs = aProject.getTimelogs();
					timelogs.forEach((aTimelog) => {
						//console.log(aTimelog);
						fileText = `${fileText}${aTimelog}${newline}`
					});
				}
			});
		}
		
		this.saveTextAsFile(fileText,fileName)
		
		this.updateStorage();
	}
	
	saveAsSpreadsheet() {
		// save as a csv file that can be opened in Excel nicely
		// useful for making burndown charts
		
		let fileText;
		let newline = '\r\n';
		let fileName = 'Timelog Spreadsheet.csv';
		
		fileText = `Timelogs${newline}`
		
		
		// organise per project
		this.allProjects.forEach((aProject) => {
			//console.log('Saving project: ' + aProject.name);
			fileText = `${fileText}${newline}${aProject}${newline}`
			
			// start time
			let projectStart = aProject.getStartTime();
			projectStart = getFirstDayOfWeek(projectStart);
			
			let startWeek = {start: projectStart, hours: 0}
			
			// finish time
			let projectFinish = aProject.getLastTime();
			projectFinish = getFirstDayOfWeek(projectFinish)
			
			let weeks = [startWeek];
			
			let weekCount = weeksBetween(projectStart, projectFinish);
			
			function getWeek(start) {
				let result = null;
				weeks.forEach((aWeek) => {
					if ( aWeek.start.getTime() == start.getTime() ) {
						result = aWeek;
					}
				});
				return result;
			}
			
			
			let timelogs = aProject.getTimelogs();
			timelogs.forEach((aTimelog) => {
				
				let start = getFirstDayOfWeek(aTimelog.start)
				let week = getWeek(start);
				if ( week == null ) {
					week = {start: start, hours: 0}
					weeks.push(week);
				}
				
				let time = aTimelog.getDeltaTime() / 60 // hours
				if ( time != null ) {
					week.hours += time;
				}
			});
			
			if ( weeks.length < weekCount ) {
				// not all the weeks between the start and finish are here, add empty ones
				let currentWeek = startWeek;
				for (var i = 1; i < weekCount; i++) {
					// create the next week
					currentWeek = {start: new Date(currentWeek.start), hours: 0};
					currentWeek.start.setDate(currentWeek.start.getDate()+7)
					let existingWeek = getWeek(currentWeek.start);
					if ( existingWeek == null ) {
						// week not there, add it
						weeks.push(currentWeek);
						//console.log('adding empty week');
					}
					//console.log(currentWeek);
				}
			}
			
			weeks.sort(function(a,b){
				return new Date(a.start) - new Date(b.start);
			});
			//console.log(weeks);
			
			fileText = `${fileText}${newline}Week,Hours`
			
			weeks.forEach((aWeek) => { 
				fileText = `${fileText}${newline}${aWeek.start.getDate()}/${aWeek.start.getMonth()+1}/${aWeek.start.getFullYear()},${aWeek.hours}`
			});
			fileText = `${fileText}${newline}${newline}${newline}${newline}`
			
		});
		
		function getFirstDayOfWeek(d) {
			d = new Date(d);
			
			// set to start of day
			d.setHours(0);
			d.setMinutes(0);
			d.setSeconds(0);
			d.setMilliseconds(0);
			
			var day = d.getDay(),
				diff = d.getDate() - day + (day == 0 ? -6:1);
			return new Date(d.setDate(diff));
		}
		
		function weeksBetween(d1, d2) {
			return Math.round((d2 - d1) / (7 * 24 * 60 * 60 * 1000)) + 1;
		}
		
		//console.log(fileText);
		
		this.saveTextAsFile(fileText,fileName)
		
		this.updateStorage();
		
	}
	
	saveTextAsFile( textToWrite, fileNameToSaveAs ){
		var textFileAsBlob = new Blob([textToWrite], {type:'text/csv'});
		var downloadLink = document.createElement("a");
		function destroyClickedElement(event) {
			document.body.removeChild(event.target);
		}

		downloadLink.download = fileNameToSaveAs;
		downloadLink.innerHTML = "Download File";
		//if (URL != null) {
			// Chrome allows the link to be clicked
			// without actually adding it to the DOM.
			downloadLink.href = URL.createObjectURL(textFileAsBlob);
		//}
		//else    {
			// Firefox requires the link to be added to the DOM
			// before it can be clicked.
			downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
			downloadLink.onclick = destroyClickedElement;
			downloadLink.style.display = "none";
			document.body.appendChild(downloadLink);
		//}
		downloadLink.click();
	};
	
}