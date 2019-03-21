import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { SeedBatch } from "famifarm-typescript-models";
import strings from "src/localization/strings";

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  seedBatches?: SeedBatch[];
  onSeedBatchesFound?: (seedBatches: SeedBatch[]) => void;
}

export interface State {
  seedBatches: SeedBatch[];
}

class SeedBatchList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      seedBatches: []
    };
  }

  /**
   * Component did mount life-sycle event
   */
  async componentDidMount() {
    if (!this.props.keycloak) {
      return;
    }

    const seedBatchService = await Api.getSeedBatchesService(this.props.keycloak);
    seedBatchService.listSeedBatches().then((seedBatches) => {
      this.props.onSeedBatchesFound && this.props.onSeedBatchesFound(seedBatches);
    });
  }

  /**
   * Render seed batch list view
   */
  render() {
    if (!this.props.seedBatches) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader active size="medium" />
        </Grid>
      );
    }

    const seedBatches = this.props.seedBatches.map((seedBatch) => {
      const seedBatchPath = `/seedBatches/${seedBatch.id}`;
      return (
        <List.Item key={seedBatch.id}>
          <List.Content floated='right'>
            <NavLink to={seedBatchPath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Header>{seedBatch.code}</List.Header>
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
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List>
              {seedBatches}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
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
    onSeedBatchesFound: (seedBatches: SeedBatch[]) => dispatch(actions.seedBatchesFound(seedBatches))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SeedBatchList);