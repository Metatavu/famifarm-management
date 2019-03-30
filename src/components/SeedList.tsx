import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Seed } from "famifarm-typescript-models";
import strings from "src/localization/strings";
import { StoreState, ErrorMessage } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";
import LocalizedUtils from "src/localization/localizedutils";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  seeds?: Seed[];
  onSeedsFound?: (seeds: Seed[]) => void,
  onError: (error: ErrorMessage) => void
}

export interface State {
  seeds: Seed[];
}

class SeedsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      seeds: []
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

      const seedsService = await Api.getSeedsService(this.props.keycloak);
      const seeds = await seedsService.listSeeds();
      seeds.sort((a, b) => {
        let nameA = LocalizedUtils.getLocalizedValue(a.name)
        let nameB = LocalizedUtils.getLocalizedValue(b.name)
        if(nameA < nameB) { return -1; }
        if(nameA > nameB) { return 1; }
        return 0;
      });
      this.props.onSeedsFound && this.props.onSeedsFound(seeds);
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Render seed list view
   */
  public render() {
    if (!this.props.seeds) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    const seeds = this.props.seeds.map((seed) => {
      const seedPath = `/seeds/${seed.id}`;
      return (
        <List.Item key={seed.id}>
          <List.Content floated='right'>
            <NavLink to={seedPath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Header>{LocalizedUtils.getLocalizedValue(seed.name)}</List.Header>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.seeds}</h2>
          <NavLink to="/createSeed">
            <Button className="submit-button">{strings.newSeed}</Button>
          </NavLink>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List>
              {seeds}
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
    seeds: state.seeds,
    seed: state.seed
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onSeedsFound: (seeds: Seed[]) => dispatch(actions.seedsFound(seeds)),
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SeedsList);