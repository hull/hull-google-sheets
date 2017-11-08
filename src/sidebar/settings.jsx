import React from "react";
import PropTypes from "prop-types";
import jwt from "jwt-simple";

class Settings extends React.Component {

  constructor(props) {
    super(props);
    this.state = props.settings || {};
  }

  handleTokenChange(e) {
    const hullToken = e.target.value;
    this.setState({ hullToken });
  }

  handleSaveSettings(e) {
    this.props.onSave(this.state);
  }

  getConfigFromToken() {
    try {
      return jwt.decode(this.state.hullToken, "", true);
    } catch(err) {
      return {};
    }
  }

  renderConfig() {
    const config = this.getConfigFromToken();
    if (config && config.id) {
      return (
        <div>
          <div className="form-group block">
            <label>
              <b>Organization</b>
            </label>
            <p>{config.organization}</p>
          </div>
          <div className="form-group block">
            <label>
              <b>Connector</b>
            </label>
            <p>{config.id}</p>
          </div>
        </div>
      )
    }
  }

  render() {
    const { hullToken = "" } = this.state;
    const config = this.getConfigFromToken();
    return (
      <div>
        <p><b>You can find the Hull token on the Connector page&apos;s overview.</b></p>
        <div className="form-group block">
          <label htmlFor="token">
            Hull Token
          </label>
          <input type="text" id="token" value={hullToken} onChange={this.handleTokenChange.bind(this)} />
        </div>
        <div className="block">
          <button className="blue" disabled={!hullToken} onClick={this.handleSaveSettings.bind(this)}>Save</button>
        </div>
        <hr />
        {this.renderConfig()}
      </div>
    );
  }
}

Settings.propTypes = {
  hullToken: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired
};

export default Settings;