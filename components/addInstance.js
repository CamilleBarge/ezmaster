'use strict';

var vm = new Vue({
  el: '#addInstance',
  methods : {
  	displayFormAddInstance : function (event) {
			$('#modal-add-instance').show();
			this.project = $("#inputProject").val();
  	},

  	cancelAddInstance : function (event) {
  		$('#modal-add-instance').hide();
  	},

  	addInstance : function (event) {
  		this.title = $("#inputTitle").val();
  		this.project = $("#inputProject").val();
  		this.study = $("#inputStudy").val();
  		this.version = $("#inputVersion").val();
			this.technicalName = this.project + '-' + this.study + '-' + this.version;

			$("#save").hide();
			$("#close_modal").hide();
			$("#loader").show();

  		var data = {
  			'title' : this.title,
  			'project' : this.project,
  			'version' : this.version,
  			'study': this.study,
  			'technicalName' :  this.technicalName,
  			'app' : $("#app").val()
  		}
  		this.$http.post('/-/v1/instances', data).then(function (result) {
  			console.log(result);
  			if (result.status == 200) { location.reload(); }
  		}, function (error) {
  			if (error.status == 409) {
  				$("#technicalNameExists").show();
					$("#loader").hide();
					$("#save").show();
					$("#close_modal").show();
  			}
  		});
  	}
  },
  data : {
  	title : '',
  	project: '',
  	version : '',
  	study : '',
  	technicalName : '',
    containers : []
  }
});

module.exports = vm;