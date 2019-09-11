class MainCtrl {
	constructor() {
		this.timelogger = new Timelogger();
		this.content = [];
		var data = JSON.parse(localStorage.getItem('timelogs'));
		if ( data !== null ) {
			// resume from last used timelogs
			this.showContentFromStorage(data);
		}
		this.input = {
			Project: null,
			Phase: null,
			PDate: null,
			Start: null,
			IntTime: null,
			Finish: null,
			Notes: null
		}
		this.newProjectName = null;
		this.phases = [
			{id: 1, name: 'Initiation'},
			{id: 2, name: 'Definition'},
			{id: 3, name: 'Design'},
			{id: 4, name: 'Development'},
			{id: 5, name: 'Inplementation'},
			{id: 6, name: 'Maintenance'}
		]
		this.saveprojects = [];
		this.saveall = true;
		this.savespreadsheet = false;
		//console.log(this.timelogger);
	}
	
 	addTimelog() {
		//console.log(this.input.Project)
		//console.log(this.input)
		// add inputs to timelogger as a new timelog
		this.timelogger.addTimelog(this.input.Project, this.input.Phase, this.input.PDate, this.input.Start, this.input.IntTime, this.input.Finish, this.input.Notes)
		//console.log(this.input)
		// reset inputs
		this.input = {
			Project: null,
			Phase: null,
			PDate: null,
			Start: null,
			IntTime: null,
			Finish: null,
			Notes: null
		};
		//console.log(this.timelogger)
	}
	
	recordTimelog() {
		if ( this.input.Project != null || this.input.Phase != null || this.input.Notes != null) {
			// start recording a time log with information in the time log form below
			this.timelogger.recordTimelogWithValues('start', this.input.Project, this.input.Phase, this.input.Notes);
			// reset inputs
			this.input = {
				Project: null,
				Phase: null,
				PDate: null,
				Start: null,
				IntTime: null,
				Finish: null,
				Notes: null
			};
		} else {
			this.timelogger.recordTimelog('start');
		}
	}
	
	removeTimelog(id) {
		this.timelogger.removeTimelog(id);
		
		// this is needed because once the timelog is removed, so is the dialog box for it
		// which means that bootstrap doesn't remove the "modal-backdrop fade in" background etc
		document.getElementById("body").className = "ng-scope";
		document.getElementById("body").style = "";
		
		const elements = document.getElementsByClassName("modal-backdrop fade in");
		while (elements.length > 0) elements[0].remove();
	}
	
	saveTimelogs() {
		// check if we want to save all time logs
		// or only time logs from some projects
		//console.log(this.saveall);
		//console.log(this.saveprojects);
		if ( this.savespreadsheet ) {
			this.timelogger.saveAsSpreadsheet();
		} else {
			if ( this.saveall ) {
				this.timelogger.saveTimelogsToFile('all');
			} else {
				this.timelogger.saveTimelogsToFile(this.saveprojects);
			}
		}
	}
	
	updateProjectName(oldName, newName) {
		this.timelogger.updateProjectName(oldName, newName);
		this.newProjectName = null;
	}
	
	setUp () {
		for (let data of this.content) {
			/* for (let item of data) {
				// convert null strings to nulls
				if ( item == "null" ) {
					console.log('null found')
					item = null;
				}
			} */
			
			// convert null strings to nulls
			for(var i = data.length - 1; i >= 0; i--) {
				// trim to remove newlines at ends
				if( data[i].trim() == "null" ) {
					data[i] = null;
				}
			}
			
			// parse dates as ints for now (time in miliseconds)
			let finish = data[5];
			// only finish should ever be null instead of number
			if ( finish != null ) {
				// only parse as int if not null
				finish = parseInt(finish);
			}
			
			let notes = data[6];
			if ( notes != null ) {
				// replace newline strings with actual newlines
				notes = notes.replace(/\\n/g, '\n');
				// replace escaped commas with actual commas
				notes = notes.replace(/\\,/g, ',');
			}
			
			// add new timelog
			this.timelogger.addTimelog(data[0], data[1], parseInt(data[2]), parseInt(data[3]), data[4], finish, notes)
			// todo: add notes seperately
		}
		//console.log(this.timelogger);
    }

    showContent(fileContent) {
        this.content = [];

        let listData = fileContent.split('\n');

        for (let line of listData) {
			var regex = new RegExp("(?<!\\\\),"); 
			let items = line.split(regex);
            
			if (items[0] == "") {
				// don't add empty lines
				continue
			}
			//console.log(items)
			this.content.push(items)

        }

        this.setUp();
    }
	
	showContentFromStorage(data) {
		this.content = [];
		
		for (let line of data) {
			// use regex negative look behind to make sure it is not an escaped comma
			// (?<!\\),
			var regex = new RegExp("(?<!\\\\),"); 
			let items = line.split(regex);
			
			if (items[0] == "") {
				// don't add empty lines
				continue
			}
			this.content.push(items)
		}
		
		this.setUp();
	}
}
