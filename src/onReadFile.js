class onReadFile {
	constructor($parse) {
		this.restrict = 'A';
		this.parse = $parse;
	}
	
	link(scope, element, attrs) {
		var fn = this.parse(attrs.onReadFile);

		element.on('change', function(onChangeEvent) {
			var reader = new FileReader();

			reader.onload = function(onLoadEvent) {
				scope.$apply(function() {
					fn(scope, {
						fileContent: onLoadEvent.target.result
					});
				});
			}
			
			if ((onChangeEvent.srcElement || onChangeEvent.target).files[0] != undefined ) {
				// this will be undefined if someone pushes the choose file button but then cancels instead of selecting a file
				reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
			}
		});
	}

}