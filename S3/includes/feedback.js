/*
  Jquery Validation using jqBootstrapValidation
  */
$(function() {

 $("input,textarea").jqBootstrapValidation(
    {
     preventSubmit: true,
     submitError: function($form, event, errors) {
      // something to have when submit produces an error ?
      // Not decided if I need it yet
     },
     submitSuccess: function($form, event) {
      event.preventDefault(); // prevent default submit behaviour
      // Get values from FORM
      // If any additional fields are added they need to be captured here.
      var name = $("input#name").val();
      var email = $("input#email").val();
      var subject = $("input#subject").val();
      var message = $("textarea#message").val();
      var firstName = name; // For Success/Failure Message
      // Check for white space in name for Success/Fail message
      if (firstName.indexOf(' ') >= 0) {
	    firstName = name.split(' ').slice(0, -1).join(' ');
      }
	// Convert form data variables to JSON array for AWS API Gateway
	var formdata = {name: name,email: email,subject: subject,message: message};
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
            		.append("Thank you, your feedback has been received.");
 		  $('#success > .alert-success')
 			.append('</div>');

 		  //clear all fields
 		  $('#contactForm').trigger("reset");
 	      },
 	   error: function() {
 		// Fail message
 		 $('#success').html("<div class='alert alert-danger'>");
            	$('#success > .alert-danger').html("")
            	 .append( "</button>");
            	$('#success > .alert-danger').append("WHOA! Sorry "+firstName+", it seems my email system is having a moment... Please email me directly to <a href='mailto:hen_feedback@hartenergy.com'>hen_feedback@hartenergy.com</a>.");
 	        $('#success > .alert-danger').append('</div>');
 		//clear all fields
 		$('#contactForm').trigger("reset");
 	    },
           })
         },
         filter: function() {
                   return $(this).is(":visible");
         },
       });

      $("a[data-toggle=\"tab\"]").click(function(e) {
                    e.preventDefault();
                    $(this).tab("show");
        });
  });


/*When clicking on Full hide fail/success boxes */
$('#name').focus(function() {
     $('#success').html('');
  });
