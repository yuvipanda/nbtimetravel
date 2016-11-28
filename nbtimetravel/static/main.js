define([
  'base/js/namespace',
  'notebook/js/outputarea',
  'base/js/events',
], function (
  Jupyter, oa, events
) {
  // Version of the extension. Allows us to upgrade the format in backwards
  // compatible ways.
  var timetravelVersion = '1.0';

  // No event for this, so we monkeypatch!
  // MONKEY SEE, MONKEY PATCH!
  oa.OutputArea.prototype._handle_output = oa.OutputArea.prototype.handle_output;
  oa.OutputArea.prototype.handle_output = function (msg) {
    if (!this.cell.metadata.history) {
      this.cell.metadata.history = [];
    }
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
        content: msg.content,
        metadata: msg.metadata
      }
    });

    return this._handle_output(msg);
  };

  var load_ipython_extension = function () {
    // This extension is only enabled for notebooks that have explicitly set a
    //
    // timetravel: { enabled: true }
    //
    // in the notebook metadata so that only notebooks that have been tested to
    // not get too big will record history. This should eventually be replaced
    // with a size limit on the history, but this will do for now.
    //
    // TODO: Replace with a size limit on history
    var timetravelMeta = Jupyter.notebook.metadata.timetravel;
    var isTimetravelEnabled = timetravelMeta && timetravelMeta.enabled;

    if (isTimetravelEnabled) {
      // Modifies the metadata of the notebook itself:
      // Sets version if it doesn't exist
      if (!timetravelMeta.version) {
        timetravelMeta.version = timetravelVersion;
      }

      events.on('execute.CodeCell', function(ev, payload){
        // Output area objects don't know what cells they belong to!
        // We use this to tell them
        // We keep re-setting it, but the other option was to monkeypatch
        // CodeCell's fromJSON (for initial cell loading) and create_element
        // calls. Unfortunately nbextensions run too late to usefully
        // monkeypatch fromJSON, so this is what we gotta do.
        payload.cell.output_area.cell = payload.cell;
      });
    }

    // This allows us to incrementally upgrade our format in the future
    // in backwards compatible ways
    Jupyter.notebook.metadata.timetravel = {
      'version': '1.0' // Data structure version
    };
  };

  return {
    load_ipython_extension: load_ipython_extension,
  };
});
