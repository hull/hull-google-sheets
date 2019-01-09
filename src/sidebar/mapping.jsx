import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Creatable } from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';


const MANDATORY_FIELDS = ["email", "external_id"];

class Mapping extends React.Component {

  getMappings() {
    const { columns = [], hullFields = [], mapping = [] } = this.props;
    return _.zip(columns, mapping)
            .map(([ colName, cfg ], idx) => ([ colName, cfg || {} ]))
  }

  getHullFieldOptions(additionalField) {
    const { hullFields = [], mapping = [] } = this.props;
    const fields = _.compact(_.uniq(hullFields.concat([additionalField])));
    return fields.map(value => ({ value, label: value.replace(/^traits_/, '').replace(/^account\./, 'Account > ') }));
  }

  updateMapping(idx, mpg) {
    const { mapping } = this.props;
    const { enabled = true } = mapping[idx] || {};
    mapping[idx] = Object.assign({}, mapping[idx], mpg);
    this.props.onChange(mapping);
  }

  updateHullField = (idx, e) => {
    const hullField = e ? e.value : null;
    return this.updateMapping(idx, { hullField, enabled: !!hullField });
  }

  getMappedField(name) {
    const { columns = [], mapping = [] } = this.props;
    const idx = _.findIndex(mapping, m => m && m.enabled && m.hullField === name);
    const column = idx > -1 && columns[idx];
    return column && { idx, column, mapping: mapping[idx] };
  }

  renderMappedField(name) {
    const mapped = this.getMappedField(name);
    if (mapped) {
      return (
        <p>
          <b>{name}</b> field mapped to <b>{mapped.column}</b> column
        </p>
      );
    }

    return (
      <p className="grey">
        <b>{name}</b> missing
      </p>
    )
  }

  isMappingValid() {
    return _.some(MANDATORY_FIELDS, this.getMappedField.bind(this));
  }

  render() {
    const { hullFields = [] } = this.props;
    const mappings = this.getMappings();
    const isMappingValid = this.isMappingValid();
    return (
      <div style={{ paddingBottom: "5em" }}>
        <h4>Fields used to identify users</h4>
        {MANDATORY_FIELDS.map(this.renderMappedField.bind(this))}
        <hr />
        <h4>Columns mapping</h4>
        <div className="form-group">
          {mappings.map(([colName, { enabled, hullField = "" }], idx) => (
          <div key={`mapping-${idx}`} style={{paddingBottom: 10}}>
            <label htmlFor={`enabled_${idx}`} className={hullField ? "" : "gray"} style={{ display: 'block'}}>
              {colName}
            </label>
            <Creatable value={hullField}
              options={this.getHullFieldOptions(hullField)}
              onChange={this.updateHullField.bind(this, idx)} />
          </div>
          ))}
          <div>
            {!isMappingValid && <p>At least one of those two fields has to be linked for the import to be possible</p>}
            <button className="blue" disabled={!isMappingValid} onClick={this.props.onStartImport}>Start Import...</button>
          </div>
        </div>
      </div>
    )
  }
}

Mapping.proptypes = {
  columns: PropTypes.array,
  hullFields: PropTypes.array,
  mapping: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onStartImport: PropTypes.func.isRequired
};

export default Mapping;
