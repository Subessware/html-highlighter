/**
 * @file HTML Highlighter example.
 * @copyright 2015 Diffeo
 *
 * Comments:
 *
 */

require( [ 'js/ner' ] );
(function (factory, window) {
  window.require( [ 'jquery', 'src/html_highlighter' ], function ($, hh) {
    return factory(window, $, hh);
  } 
 
  );

}(function (window, $, hh, undefined) {

  var MAX_HIGHLIGHT = 12;

  var elSelector = $('#filter-data'),
      elDocument = $(".sentence"),
      elWidgetSelection = $('#widget-selection'),
      elWidgetMain = $('#widget-main'),
      elSearch = $('#search'),
      elAdd = $('#add');

  var count = 0,
      mouseDown = 0,
      highlighter;


  function init()
  {
    /* Set-up sequence
     * --
     * UI */
 

    elSelector
      .change(function () { load(parseInt(elSelector.val())); } )
      .children().remove();

    var timeout = null;
    elDocument.on( {
		
      dblclick: function () { mouseDown = 0; },
      mouseup: function () {
        -- mouseDown;
		count = setCount($(this));
		var elasticSearchId = $(this).attr("elastic-search-id");
	    var parent_id = $(this).parent().attr('id');
	    var sentText = $(this).text().trim();
		var encodedText = $(this).attr("tokens");
        /* Process text selection with a delay to ensure accurate results. */
        if(timeout !== null) window.clearTimeout(timeout);
        timeout = window.setTimeout(function () {
          timeout = null;
          if(mouseDown !== 0) return;
			
          var range = highlighter.getSelectedRange();
          if(range === null) {
            console.log("null range");
            return;
          }

          

          var xpath = range.computeXpath();
          /*elWidgetSelection.find('.xpath')
            .text(xpath.start.xpath + ':' + xpath.start.offset
                  + ' - ' + xpath.end.xpath + ':' + xpath.end.offset);*/

          highlight_(xpath.start, xpath.end);
          highlighter.clearSelectedRange();
          //elWidgetSelection.addClass('enabled');
		  
		 /* alert(
            range.content.root.id + "\n"
              + 'start =' + range.start.offset + '\n'
			+ 'end = ' + range.end.offset + '\n'
				+ 'ES ID = ' + elasticSearchId + '\n'
				+ 'parent id = ' +parent_id + '\n'
				+ 'sentText = ' + sentText + '\n'
				+ 'encodedText = ' +encodedText + '\n');*/
				createRows(parent_id, elasticSearchId, sentText, encodedText, "hh-highlight-"+(count-1),  range.start.offset, range.end.offset);
        }, 150);
      },
      mousedown: function () {
        ++ mouseDown;
      }
    } );

    /* Done setting up.  Now load mock data. */
    var next = function (i) {
        highlighter = new hh.HtmlHighlighter( {
          container: elDocument,
          widget: elWidgetMain,
          maxHighlight: MAX_HIGHLIGHT
        } );

       // load(0);
        return;
    };

    next(0);
  }

  function setCount(selectedEl) {
	  prev = -1;
	  $(selectedEl).find("span[class*='hh-highlight-id']").each(function() {
		hhclass = $(this).attr('class').split(/\s+/)[1]
		if (hhclass != "hh-highlight-"+(prev+1)) {
			count = prev+1;
			return;
		}
		prev = prev+1;
	  });
	  return prev+1;
  }
  function load(index)
  {
    highlighter.clear().apply();
    elDocument.html($(".sentence"));
    highlighter.refresh();
    elSearch.focus();
  }

  /* TODO: the following is a nasty hack which was quickly written as a proof
   * of concept and is thus NOT meant to be used in real applications. */
  function highlight_(start, end)
  {
    var hit,
        finder = new hh.HtmlXpathFinder(
          highlighter.content,
          { start: start, end: end });

    if((hit = finder.next()) !== false)
      new hh.HtmlRangeHighlighter(count).do(hit);

    if(++ count >= MAX_HIGHLIGHT)
      count = 0;
  }


  /* Initialise module */
  init();

}, window));

function createRows(parent_id, elasticSearchId, sentText, encodedText, className, start, end) {
	
	createTagRow(parent_id, elasticSearchId, sentText, encodedText, className, start, end);
}