/*
  Jquery Validation using jqBootstrapValidation
*/
$(function() {
  $("input,textarea").jqBootstrapValidation({
    preventSubmit: true,
    submitError: function($form, event, errors) {
      // something to have when submit produces an error ?
      // Not decided if I need it yet
    },
    submitSuccess: function($form, event) {
      event.preventDefault(); // prevent default submit behaviour
      // Get values from FORM
      var formdata = {
        name: $("input#name").val(),
        email: $("input#email").val(),
        subject: $("input#subject").val(),
        message: $("textarea#message").val()
      };
      // If submitted name has a space, carve off the first name for response.
      var firstName = (formdata.name.indexOf(' ') >= 0)
                    ? formdata.name.split(' ').slice(0, -1).join(' ')
                    : formdata.name;
      // Convert formdata to JSON string for APIG
      formdata = JSON.stringify(formdata);
      $.ajax({
        url: "https://x840ml1te8.execute-api.us-west-2.amazonaws.com/prod/feedback/",
        dataType: 'json',
        type: "POST",
        data: formdata,
        cache: false,
      	success: function() {
      	  // Success message
      	  $('#success').html("<div class='alert alert-success'>");
      	  $('#success > .alert-success').html("")
      		.append( "</button>");
      	  $('#success > .alert-success')
      		.append(`Thank you ${firstName}, your feedback has been received.`);
		      $('#success > .alert-success')
			    .append('</div>');
		      //clear all fields
		      $('#contactForm').trigger("reset");
	      },  // End success
	      error: function() {
		      // Fail message
		      $('#success').html("<div class='alert alert-danger'>");
          $('#success > .alert-danger').html("")
          .append( "</button>");
          $('#success > .alert-danger')
          .append(`WHOA! Sorry ${firstName}, it seems my email system is having a moment... Please try again later.`);
	        $('#success > .alert-danger').append('</div>');
		      //clear all fields
		      $('#contactForm').trigger("reset");
        },  // End error
      });  // End ajax
    },  // End submitSuccess
    filter: function() {
      return $(this).is(":visible");
    },  // End filter
  }); // End jqBootstrapValidation

  $("a[data-toggle=\"tab\"]").click(function(e) {
    e.preventDefault();
    $(this).tab("show");
  });
}); // End function

/*When clicking on Full hide fail/success boxes */
$('#name').focus(function() {
  $('#success').html('');
});
