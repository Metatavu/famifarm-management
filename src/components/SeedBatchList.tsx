import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Seed, SeedBatch } from "../generated/client";
import strings from "../localization/strings";

import {
  List,
  Button,
  Grid,
  Loader,
  Checkbox
} from "semantic-ui-react";
import LocalizedUtils from "../localization/localizedutils";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  seedBatches?: SeedBatch[];
  onSeedBatchesFound?: (seedBatches: SeedBatch[]) => void,
   onError: (error: ErrorMessage | undefined) => void
}

export interface State {
  seedBatches: SeedBatch[],
  seeds: Seed[],
  showPassive: boolean,
  loading: boolean
}

class SeedBatchList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      seeds: [],
      seedBatches: [],
      showPassive: false,
      loading: false
    };
  }

  /**
   * Component did mount life-sycle event
   */
  public async componentDidMount() {
    try {
      if (!this.props.keycloak) {
        return;
      }
      const seedService = await Api.getSeedsService(this.props.keycloak);
      const seeds = await seedService.listSeeds({});
      const seedBatchService = await Api.getSeedBatchesService(this.props.keycloak);
      const seedBatches = await seedBatchService.listSeedBatches({includePassive: this.state.showPassive});
      seedBatches.sort((a, b) => {
        let nameA = a.code || "";
        let nameB = b.code || "";
        if(nameA < nameB) { return -1; }
        if(nameA > nameB) { return 1; }
        return 0;
      });
      this.setState({ seeds });
      this.props.onSeedBatchesFound && this.props.onSeedBatchesFound(seedBatches);
    } catch (e: any) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Render seed batch list view
   */
  public render() {
    if (this.state.loading) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }
    if (!this.props.seedBatches) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    const seedBatches = this.props.seedBatches.map((seedBatch, i) => {
      const seedBatchPath = `/seedBatches/${seedBatch.id}`;
      const seed = this.state.seeds.find(s => s.id == seedBatch.seedId);
      const seedText = seed ? LocalizedUtils.getLocalizedValue(seed.name) : "";
      return (
        <List.Item style={i % 2 == 0 ? {backgroundColor: "#ddd"} : {}} key={seedBatch.id}>
          <List.Content floated='right'>
            <NavLink to={seedBatchPath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Content>
            <List.Header style={{paddingTop: "10px"}}>{`${seedBatch.code} / ${seedText}`}</List.Header>
          </List.Content>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.seedBatches}</h2>
          <NavLink to="/createSeedBatch">
            <Button className="submit-button">{strings.newSeedBatch}</Button>
          </NavLink>
          <Checkbox checked={this.state.showPassive} onChange={this.onShowPassiveChange} label={strings.showPassiveSeedBatches} />
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List divided animated verticalAlign='middle'>
              {seedBatches}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  private onShowPassiveChange = async () => {
    const showPassive = !this.state.showPassive;
    await this.setState({showPassive});
    await this.updateSeedBatchesList().catch((err) => {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: err
      });
    });
  }

  private updateSeedBatchesList = async () => {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({loading: true});
    const seedBatchesService = Api.getSeedBatchesService(this.props.keycloak);
    const seedBatches = await (await seedBatchesService).listSeedBatches({includePassive: this.state.showPassive});
    seedBatches.sort((a, b) => {
      let nameA = a.code || "";
      let nameB = b.code || "";
      if(nameA < nameB) { return -1; }
      if(nameA > nameB) { return 1; }
      return 0;
    });
    this.props.onSeedBatchesFound && this.props.onSeedBatchesFound(seedBatches);
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
    seedBatches: state.seedBatches,
    seedBatch: state.seedBatch
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onSeedBatchesFound: (seedBatches: SeedBatch[]) => dispatch(actions.seedBatchesFound(seedBatches)),
     onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SeedBatchList);