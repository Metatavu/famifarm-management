import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { NavLink } from 'react-router-dom';
import { Seed } from 'famifarm-client';

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";

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

  componentDidMount() {
    new FamiFarmApiClient().listSeeds(this.props.keycloak!, 0, 100).then((seeds) => {
      console.log(seeds);
      this.props.onSeedsFound && this.props.onSeedsFound(seeds);
    });
  }

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
        <List.Item>
          <List.Content floated='right'>
            <NavLink to={seedPath}>
              <Button className="submit-button">Avaa</Button>
            </NavLink>
          </List.Content>
          <List.Header>{seed.name![0].value}</List.Header>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>Siemenet</h2>
          <NavLink to="/createSeed">
            <Button className="submit-button">Uusi siemen</Button>
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