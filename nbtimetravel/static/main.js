define([
  'jquery',
  'underscore',
  'base/js/namespace',
  'notebook/js/outputarea',
  'base/js/events',
], function (
  $, _, Jupyter, oa, events
) {

  // Version of the extension. Allows us to upgrade the format in backwards
  // compatible ways.
  var timetravelVersion = '1.0';
  var timetravelMeta;

  function indicatorToMsg() {
    if (timetravelMeta.enabled) {
      return 'On';
    } else {
      return 'Off';
    }
  }

  function displayMsg() {
    $('#nbTimeTravelIndicator').text(indicatorToMsg());
  }

  function createButton() {
    $('#maintoolbar-container').append(
      $('<div>').addClass('btn-group').addClass('pull-right')
        .append($('<button>')
          .attr('id', 'nbtimetravel-button')
          .addClass('btn')
          .addClass('btn-default')
          .append(
            $('<strong>').text('TimeTravel: '))
          .append(
            $('<span>').attr('id', 'nbTimeTravelIndicator')
                       .attr('title', 'Indicates whether or not timetravel is active.')
          )
        )
    );
  }

  // No event for this, so we monkeypatch!
  // MONKEY SEE, MONKEY PATCH!
  oa.OutputArea.prototype._handle_output = oa.OutputArea.prototype.handle_output;
  oa.OutputArea.prototype.handle_output = function (msg) {
    if (timetravelMeta.enabled) {
      if (!this.cell.metadata.history) {
        this.cell.metadata.history = [];
      }

      // Only record whitelisted content types
      var recordedContent = _.clone(msg.content);
      recordedContent.data = _.pick(msg.content.data || {},
                                    timetravelMeta.allowedContentTypes);

      this.cell.metadata.history.push({
        // Record dates clientside, rather than serverside.
        // This lets us consistently use the same time source in *most*
        // cases.
        timestamp: (new Date()).toISOString(),
        code: this.cell.get_text(),
        // We record the responses that're required to recreate the state
        // in the OutputArea object.
        response: {
          version: msg.header.version,
          msg_type: msg.msg_type,
          content: recordedContent,
          metadata: msg.metadata,
        }
      });
    }

    return this._handle_output(msg);
  };


  var load_ipython_extension = function () {
    // Initialize timetravel metadata if needed
    Jupyter.notebook.metadata.timetravel = (
      Jupyter.notebook.metadata.timetravel || {});

    // Add some metadata to the notebook itself.
    timetravelMeta = Jupyter.notebook.metadata.timetravel;
    _.defaults(timetravelMeta, {
      // Disable the extension by default
      enabled: false,

      // Version the history format
      version: timetravelVersion,

      // Only these content types will be recorded in the history. Used to
      // prevent file size growth from recording plots.
      allowedContentTypes: [
        'text/plain',
      ],
    });

    // Initialize button toggle
    createButton();
    displayMsg();

    events.on('execute.CodeCell', function(ev, payload){
      // Output area objects don't know what cells they belong to!
      // We use this to tell them
      // We keep re-setting it, but the other option was to monkeypatch
      // CodeCell's fromJSON (for initial cell loading) and create_element
      // calls. Unfortunately nbextensions run too late to usefully
      // monkeypatch fromJSON, so this is what we gotta do.
      payload.cell.output_area.cell = payload.cell;
    });

    $('#nbtimetravel-button').on('click', function() {
      timetravelMeta.enabled = !timetravelMeta.enabled;
      displayMsg();
    });
  };

  return {
    load_ipython_extension: load_ipython_extension,
  };

});
