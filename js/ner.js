var categories = [];

var HTML_CONTENT = "__HTMLMARKUP__";

$(document).ready(function() {
	$('[data-toggle="tooltip"]').tooltip();
	/* Reset all form fields on load*/
	$("#mturk_form").each(function() { this.reset() });
	
	document.getElementById('assignmentId').value = gup('assignmentId');

	categories = $('body').attr('categories').split(',');

	/* click listener for submit button */
	$('button[name=submit]').bind("click", function(event) {
		var submit_text = "";
		var errors = {};
		
		$('div[name=parent_container]').each(function() {
			var currSent = $(this).find('div[class=sentence]').attr('id');
			if ($($(this).find('[type=checkbox]')).is(':checked')) {} else {
			    if ($(this).find('.tag_div').length > 0) {
				$(this).find('.tag_div').each(function() {
					if ($(this).find('[type=radio]:checked').length > 0) {} else {
					    errors[currSent] = "No radio button selected";
					    submit_text = '';
					}
				    });
			    } else {
				errors[currSent] = "If nothing to highlight select \"No Annotations\"";

			    }
			}
		    });

		if (!$.isEmptyObject(errors)) {
			event.preventDefault();
		    var modalHTML = "<div> <ul>";
		    for (var e in errors) {
			modalHTML += "<li><span class=\"modal-sentID\">" + e + ": </span> " + errors[e] +
			    "</li>";
		    }
		    modalHTML += "</ul> </div>";
		    $("#modal_box .modal-body").html(modalHTML);
		    $("#modal_box").modal({show: true, keyboard: true, backdrop: 'static'});
		} else {
		   
		    $("#mturk_form").submit();		    
	}

	    });

	/* bind events */
	$(function() {
		
		$('input[name^="no_annotation"]').bind("change", noAnnotationSelected);
	})
});
		/* Event handler for no annotation checkbox. It sets the value for the checkbox. 
	The value should be consistent with the value need for result*/
	function noAnnotationSelected() {
		var elasticSearchId = $(this).attr("elastic-search-id");
		var sentContainer = ($(this).closest(".panel-primary")).find(".sentence");
		var encodedText = $(sentContainer).attr("tokens");
		var sentText = $(sentContainer).text().trim();
		/* Andrew believes that it is cleaner to use an empty space. "" corresponds to that.*/
		$(this).val(elasticSearchId + "\t" + 0 + "\t" + "" + "\t" + "no annotations" + "\t" + sentText + "\t" + encodedText + "\t" + -1 + "\n");
	}

	function computeSpanClass(categoryCount) {
	    result = '';
	    switch (categoryCount) {
            case 0:
            case 1:
            case 2:
                result = 'col-xs-4 col-md-3';
                break;
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            default:
                result = 'col-xs-2 col-md-3';
                break;
	    }
	    return result;
	}

	function computeRadioClass(categoryCount) {
	    result = '';
	    switch (categoryCount) {
            case 0:
            case 1:
            case 2:
                result = 'col-xs-6 col-md-3';
                break;
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            default:
                result = 'col-xs-9 col-md-8';
                break;
	    }
	    return result;
	}

	function computeDeleteBtnClass(categoryCount) {
	    result = '';
	    switch (categoryCount) {
            case 0:
            case 1:
            case 2:
                result = 'col-xs-1 col-md-1';
                break;
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            default:
                result = 'col-xs-1 col-md-1';
                break;
	    }
	    return result;
	}
	
	function createTagRow(fieldset_id, elasticSearchId, sentText, encodedText, class_identifier,  char_offset, token_idx) {
            var fieldset = document.getElementById(fieldset_id);
			var text = $(fieldset).find("span."+class_identifier).text();
            var name = class_identifier;
            name = name.replace(/ /g, '');

            //check if the tag is a modification of some previous selection or a new selection
            if (!$('#' + fieldset_id + '>div[id=' + name + ']').length) {
                var div = document.createElement("div");
                var span_container = document.createElement("div");

                var right_triangle = document.createElement("span");

                var radio_container = document.createElement("div");
                var deleteBtn_container = document.createElement("div");
                var span = document.createElement("span");

                $(div).attr('id', name);
                $(div).attr('class', 'tag_div top-buffer row');
                $(right_triangle).attr('class', 'glyphicon glyphicon-triangle-right');

                var span_class = computeSpanClass(categories.length);
                var radio_class = computeRadioClass(categories.length);
                var deleteBtn_class = computeDeleteBtnClass(categories.length);

                $(span_container).attr('class', span_class);
                $(radio_container).attr('class', radio_class);
                $(deleteBtn_container).attr('class', deleteBtn_class);

                $(span).addClass(class_identifier);
                // span.innerHTML = text + ' length: ' + categories.length.toString() + ' radio:' + radio_class + ' span:' + span_class;
                span.innerHTML = text;

                span_container.appendChild(right_triangle);
                span_container.appendChild(span);
                div.appendChild(span_container);

                div.appendChild(radio_container);

                $.each(categories, function(key, value) {
			var label = document.createElement("label");

			$(label).attr('class', 'radio-inline');

			$('<input />', {
				type: "radio",
				    name: fieldset_id + name,
				    value: elasticSearchId + "\t" + char_offset + "\t" + text + "\t" +
				     value + "\t" + sentText + "\t" + encodedText + "\t" + token_idx + "\n",
				    }).appendTo(label).after(value);

			radio_container.appendChild(label);
		    });



                $('<button/>', {
			class: 'deleteBtn glyphicon glyphicon-remove',
			    name: 'deleteTag'
			    }).appendTo(deleteBtn_container);


                div.appendChild(deleteBtn_container);
                fieldset.appendChild(div);
            } else {
                /* At times, while over-riding existing selection, the previous selction text goes into ::before of the glyphicon. So empty it.*/
                $('#' + fieldset_id + '>div[id=' + name + ']').find('.glyphicon-triangle-right').empty();
                $('#' + fieldset_id + '>div[id=' + name + ']').find('span[class=' + class_identifier + ']').text(
														 text);
				/* Change tha value of the raddio buttons to contain the modified text highlight*/
				$('#' + fieldset_id + '>div[id=' + name + ']').find("input[type=radio]").each(function() {
					var labelText = $(this).parent().text();
					$(this).val(elasticSearchId + "\t" + char_offset + "\t" + text + "\t" +
				    labelText + "\t" + sentText + "\t" + encodedText + "\t" + token_idx +"\n");
				});
            }
        }
        /* click listener for delete button*/
	$(document).on("click", "button[name=deleteTag]", function() {
		var curr_id = $(this).parent().parent().attr('id');
		//remove selected tag's highlight in the main sentence
		$(this).parent().parent().parent().find('span.' + curr_id).removeClass();
		//remove tag component
		$(this).parent().parent().remove();
	    });



function gup(name) {
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var tmpURL = window.location.href;
    var results = regex.exec(tmpURL);
    if (results === null)
        return "";
    else
        return results[1];
}