import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Seed } from "famifarm-typescript-models";
import strings from "src/localization/strings";

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
  onSeedsFound?: (seeds: Seed[]) => void;
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
  async componentDidMount() {
    if (!this.props.keycloak) {
      return;
    }

    const seedsService = await Api.getSeedsService(this.props.keycloak);
    seedsService.listSeeds().then((seeds) => {
      this.props.onSeedsFound && this.props.onSeedsFound(seeds);
    });
  }

  /**
   * Render seed list view
   */
  render() {
    if (!this.props.seeds) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader active size="medium" />
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

export default SeedsList;