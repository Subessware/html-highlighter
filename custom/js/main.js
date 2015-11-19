/**
 * @file HTML Highlighter example.
 * @copyright 2015 Diffeo
 *
 * Comments:
 *
 */


(function (factory, window) {

  window.require( [ 'jquery', 'src/html_highlighter' ], function ($, hh) {
    return factory(window, $, hh);
  } );

}(function (window, $, hh, undefined) {

  var MAX_HIGHLIGHT = 5;

  var dataBaseUrl = 'data/',
      dataSources = [ {
        name: 'Viber hacked',
        url: 'viber_attacked_by_syrian_electronic_army.json'
      }, {
        name: 'Viber hacked -- cropped',
        url: 'viber_attacked_by_syrian_electronic_army-cropped.json'
      }, {
        name: 'Ars Technica',
        url: 'ars_technica.json'
      }, {
        name: 'Simple',
        url: 'simple.json'
      }, {
        name: 'Spaces',
        url: 'spaces.json'
      }, {
        name: 'One paragraph',
        url: 'one_paragraph.json'
      }, {
        name: 'One paragraph with ampersand',
        url: 'one_paragraph-ampersand.json'
      }, {
        name: 'One paragraph with escaped ampersand',
        url: 'one_paragraph-ampersand_escaped.json'
      }, {
        name: 'One paragraph with nonexistent ampersand',
        url: 'one_paragraph-ampersand_nonexistent.json'
      } ];

  var elSelector = $('#filter-data'),
      elDocument = $('#document'),
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

        /* Process text selection with a delay to ensure accurate results. */
        if(timeout !== null) window.clearTimeout(timeout);
        timeout = window.setTimeout(function () {
          timeout = null;
          if(mouseDown !== 0) return;

          var range = highlighter.getSelectedRange();
          if(range === null) {
            elWidgetSelection.removeClass('enabled');
            return;
          }

          elWidgetSelection.find('.offset').text(
            range.start.marker.offset
              + '(' + range.start.offset + ')'
              + ':' + range.end.marker.offset
              + '(' + range.end.offset + ')');

          var xpath = range.computeXpath();
          elWidgetSelection.find('.xpath')
            .text(xpath.start.xpath + ':' + xpath.start.offset
                  + ' - ' + xpath.end.xpath + ':' + xpath.end.offset);

          highlight_(xpath.start, xpath.end);
          highlighter.clearSelectedRange();
          elWidgetSelection.addClass('enabled');
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

        load(0);
        return;
    };

    next(0);
  }

  function load(index)
  {
    highlighter.clear().apply();
    elDocument.html(dataSources[index].content);
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
