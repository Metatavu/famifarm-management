import * as React from "react";
import Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Facility, PackagingFilmBatch } from "../generated/client";
import strings from "../localization/strings";

import {
  List,
  Button,
  Grid,
  Loader,
  Checkbox
} from "semantic-ui-react";

export interface Props {
  keycloak?: Keycloak;
  facility: Facility;
  onError: (error: ErrorMessage | undefined) => void
}

export interface State {
  packagingFilmBatches: PackagingFilmBatch[],
  showPassive: boolean,
  loading: boolean
}

class PackagingFilmBatchList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      packagingFilmBatches: [],
      showPassive: false,
      loading: false
    };
  }

  /**
   * Component did mount life-cycle event
   */
  public async componentDidMount() {
    try {
      if (!this.props.keycloak) {
        return;
      }
      const packagingFilmBatchService = await Api.getPackagingFilmBatchesService(this.props.keycloak);
      const packagingFilmBatches = await packagingFilmBatchService.listPackagingFilmBatches({
        includePassive: this.state.showPassive,
        facility: this.props.facility
      });
      packagingFilmBatches.sort((a, b) => {
        let nameA = a.name || "";
        let nameB = b.name || "";
        if(nameA < nameB) { return -1; }
        if(nameA > nameB) { return 1; }
        return 0;
      });
      this.setState({packagingFilmBatches: packagingFilmBatches});
    } catch (e: any) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Render packaging film batch list view
   */
  public render() {
    if (this.state.loading) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }
    if (!this.state.packagingFilmBatches) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    const packagingFilmBatches = this.state.packagingFilmBatches.map((batch, i) => {
      const batchPath = `/editPackagingFilmBatch/${batch.id}`;
      return (
        <List.Item style={i % 2 === 0 ? {backgroundColor: "#ddd"} : {}} key={batch.id}>
          <List.Content floated='right'>
            <NavLink to={batchPath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Content>
            <List.Header style={{paddingTop: "10px"}}>{`${batch.name}`}</List.Header>
          </List.Content>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.packagingFilmBatches}</h2>
          <NavLink to="/createPackingFilmBatch">
            <Button className="submit-button">{strings.packagingFilm.newPackingFilmBatch}</Button>
          </NavLink>
          <Checkbox checked={this.state.showPassive} onChange={this.onShowPassiveChange} label={strings.packagingFilm.showPassivePackagingFilmBatches} />
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List divided animated verticalAlign='middle'>
              {packagingFilmBatches}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  private onShowPassiveChange = async () => {
    const showPassive = !this.state.showPassive;
    this.setState({showPassive});
    this.updatePackagingFilmBatchesList().catch((err) => {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: err
      });
    });
  }

  private updatePackagingFilmBatchesList = async () => {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({loading: true});
    const packagingFilmBatchesService = Api.getPackagingFilmBatchesService(this.props.keycloak);
    const packagingFilmBatches = await (await packagingFilmBatchesService).listPackagingFilmBatches({
      includePassive: this.state.showPassive,
      facility: this.props.facility
    });
    packagingFilmBatches.sort((a, b) => {
      let nameA = a.name || "";
      let nameB = b.name || "";
      if(nameA < nameB) { return -1; }
      if(nameA > nameB) { return 1; }
      return 0;
    });
    this.setState({packagingFilmBatches: packagingFilmBatches});
    this.setState({loading: false})
  }
}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    facility: state.facility
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PackagingFilmBatchList);