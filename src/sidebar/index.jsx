import React from "react";
import ReactDOM from "react-dom";
import ready from "domready";
import { AppContainer } from 'react-hot-loader';

import Service from "./service";
import Sidebar from "./sidebar";

ready(() => {
  const sidebar = document.getElementById("sidebar");
  const render = () => {
    ReactDOM.render(<App />, sidebar);
  }

  render();

  if (module.hot) {
    module.hot.accept("./sidebar", render);
  }
});


class App extends React.Component {

  componentDidMount() {
    this.bootstrap();
  }

  componentWillUnmount() {
    this.stopPollingActiveSheet();
  }

  bootstrap() {
    if (this.state && this.state.loading) return false;
    this.setState({ loading: true });
    this.stopPollingActiveSheet();
    Service.bootstrap().then(
      state => {
        console.warn("Thank god, I am bootstrapped !", state);
        this.setState({ loading: false });
        this.startPollingActiveSheet();
        this.setState(state);
      }
    );
  }

  startPollingActiveSheet() {
    this.activeSheetTimer = setInterval(this.getActiveSheet.bind(this), 1000);
  }

  stopPollingActiveSheet() {
    if (this.activeSheetTimer) {
      clearInterval(this.activeSheetTimer);
    }
  }

  handleSaveUserProps({ mapping, settings }) {
    return Promise.all([
      Service.setUserProp(`mapping-${this.state.activeSheetIndex}`, mapping),
      Service.setUserProp("settings", settings)
    ]).then((res) => {
      if (!_.isEqual(this.state.settings, settings)) {
        this.bootstrap();
      }
    });
  }

  getActiveSheet() {
    const { activeSheetIndex } = this.state;
    Service.getActiveSheet().then(
      ({ index, importProgress }) => {
        if (!_.isEqual(this.state.importProgress, importProgress)) {
          this.setState({ importProgress });
        }

        if (index !== activeSheetIndex) {
          this.bootstrap();
        }
      }
    );
  }

  render() {
    if (!this.state || !this.state.settings || this.state.loading) return <div>Loading...</div>;
    return (
      <AppContainer warnings={false}>
        <Sidebar saveUserProps={this.handleSaveUserProps.bind(this)}
                 bootstrap={this.bootstrap.bind(this)}
                 {...this.state} />
      </AppContainer>
    )
  }
}