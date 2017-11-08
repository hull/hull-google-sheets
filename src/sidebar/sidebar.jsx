import React from "react";

import Settings from "./settings";
import Mapping from "./mapping";
import ImportStatus from "./import-status";
import Service from "./service";


export default class Sidebar extends React.Component {

  constructor(props) {
    super(props);
    const { hullToken } = props.settings || {};
    this.state = {
      displaySettings: !hullToken,
      settings: props.settings,
      mapping: props.mapping
    };

    this.autoSaveUserProps = _.debounce(this.saveUserProps.bind(this), 1000);
  }

  toggleSettings = () => {
    this.setState({
      displaySettings: !this.state.displaySettings
    });
  }

  handleSaveSettings = (settings) => {
    this.setState({ settings }, () => {
      this.saveUserProps();
      this.toggleSettings();
    });
  }

  handleSaveMapping = (mapping) => {
    this.setState({ mapping });
    this.autoSaveUserProps();
  }

  componentWillReceiveProps(nextProps) {
    if (_.isEqual(nextProps.mapping, this.props.mapping)) {
      this.setState({ mapping: nextProps.mapping });
    }
  }

  handleStartImport = () => {
    this.setState({ loading: "Importing...", importStatus: { status: "working" } });
    return Service.importData().then(
      result => {
        this.setState({ importStatus: { status: "done", result }, loading: false });
      },
      err => {
        this.setState({ importStatus: { status: "error", message: _.get(err, "message") }, loading: false });
      }
    );
  }

  handleClearImportStatus = () => {
    this.setState({ importStatus: null });
  }

  saveUserProps = () => {
    const { mapping, settings } = this.state;
    const userProps = _.pick(this.state, "mapping", "settings");
    this.setState({ loading: "saving..." });
    this.props.saveUserProps(userProps).then(
      () => this.setState({ loading: false })
    );
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ settings: nextProps.settings });
  }

  reloadColumns = () => {
    this.props.bootstrap();
  }

  render() {
    const { loading, displaySettings, importStatus, settings, mapping } = this.state;
    const { hullFields, columns, importProgress } = this.props;

    var main;

    if (displaySettings) {
      main = <Settings settings={settings}
                       onSave={this.handleSaveSettings} />;
    } else if (importStatus) {
      main = <ImportStatus {...importStatus} progress={importProgress} clearImportStatus={this.handleClearImportStatus} />;
    } else {
      main = <Mapping hullFields={hullFields}
                      mapping={mapping}
                      columns={columns}
                      importStatus={importStatus}
                      onChange={this.handleSaveMapping}
                      onStartImport={this.handleStartImport} />;
    }

    return (
      <div>
        <div className="sidebar">
          <div>
            <span style={{float: "right"}} className="grey">{loading}</span>
            <button onClick={this.toggleSettings}>
              {displaySettings ? "Hide" : "Show"} token
            </button>
            <button onClick={this.reloadColumns}>
              Reload columns
            </button>
          </div>
          {main}
        </div>
      </div>
    );
  }
}
