import React from "react";


export default class ImportStatus extends React.Component {
  render() {

    const { status, result, progress } = this.props;
    const startOver = status === "done" ? <button onClick={this.props.clearImportStatus}>Start another import</button> : null;

    const imported = result ? result.imported : progress.imported;

    return <div>
      <p><b>Importing your sheet - {status}</b></p>

      <p>{imported || 0} imported</p>

      {startOver}
    </div>;
  }
}