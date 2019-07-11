$(function(){
    console.log('ola');


	$.validator.setDefaults({
		submitHandler: function() {
			alert("submitted!");
		}
	});

	$().ready(function() {
		// validate a form form when it is submitted
		// $(".validate").validate();

        var country_selected = $('#mcountry option:selected').val(),
            postalCode_el = $('#mpcode');

        // If selected country is Greece then set specific validation rules
        $('#mcountry').on('change',function() {
            country_selected = $(this).children('option:selected').val();
            country_selected !== 'GR' ? postalCode_el.rules('remove', 'digits') : postalCode_el.rules('add', {digits: true});
            postalCode_el.focus();
        });

        // Address validation
        jQuery.validator.addMethod("streetaddress", function(value, element) {
            return /\d{5}/.test(value) ? false : true;
        }, "Please add a valid address");

        // Phone number validation
        jQuery.validator.addMethod("phonenumber", function(value, element, params) {
            return this.optional(element) || /^\+[\d\s\-]*$/.test(value) ? true : false;
        }, "Please add the international phone code e.g. +30. No letters allowed.");

		// validate a form on keyup and submit
		$(".validate").validate({
			rules: {
				"member.password": {
					required: true,
					minlength: 6
				},
				"member.cpassword": {
					required: true,
					minlength: 6,
					equalTo: "#mpassword"
				},
				// "member.email": {
				// 	required: true,
				// 	email: true
				// },
                "member.phone": {
                    required: true,
                    rangelength: [10, 20],
                    phonenumber: true
                },
                "member.phone2": {
                    rangelength: [10, 20],
                    phonenumber: true
                },
                "member.address": {
                    required: true,
                    minlength: 4,
                    streetaddress: true
                },
                "member.postalCode": {
                    minlength: 5,
                    maxlength: function(element) {
                        return country_selected === "GR" ? 5 : 10;
                    },
                    digits: function(element) {
                        return country_selected === "GR";
                    },
                }
			},
			messages: {
				"member.password": {
					required: "Please provide a password",
					minlength: "Your password must be at least 6 characters long"
				},
				"member.cpassword": {
					required: "Please provide a password",
					minlength: "Your password must be at least 6 characters long",
					equalTo: "Please enter the same password as above"
				},
				// "member.email": "Please enter a valid email address",
                "member.phone": {
                    rangelength: "Your phone number must be at least 10 digits long, and no longer than 20 digits long"
                },
                "member.phone2": {
                    rangelength: "Your phone number must be at least 10 digits long, and no longer than 20 digits long"
                }
			},
            errorElement: "em",
			errorPlacement: function (error, element) {
				// Add the class to the error element
				error.addClass("error-msg");

				if (element.prop("type") === "checkbox") {
					error.insertAfter(element.parent("label"));
				} else {
					error.insertAfter(element);
				}
			},
            // success: function ( label, element ) {
			// 	// Add the span element, if doesn't exists, and apply the icon classes to it.
			// 	if (!$(element).next("span")[0]) {
			// 		$( "<span class='glyphicon-ok'></span>" ).insertAfter( $( element ) );
			// 	}
			// },
			highlight: function ( element, errorClass, validClass ) {
				$(element).parents(".hasfeedback").addClass("has-error").removeClass("has-success");
			},
			unhighlight: function (element, errorClass, validClass) {
				$(element).parents(".hasfeedback").addClass("has-success").removeClass("has-error");
			}
		});
	});

});
