import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { NavLink } from 'react-router-dom';
import { SeedBatch } from 'famifarm-client';

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

class SeedBatchsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      seedBatches: []
    };
  }

  componentDidMount() {
    new FamiFarmApiClient().listSeedBatches(this.props.keycloak!, 0, 100).then((seedBatches) => {
      this.props.onSeedBatchesFound && this.props.onSeedBatchesFound(seedBatches);
    });
  }

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
        <List.Item>
          <List.Content floated='right'>
            <NavLink to={seedBatchPath}>
              <Button className="submit-button">Avaa</Button>
            </NavLink>
          </List.Content>
          <List.Header>{seedBatch.code}</List.Header>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={3}>
            <h2>Siemenerät</h2>
          </Grid.Column>
          <Grid.Column width={2} floated="right">
            <NavLink to="/createSeedBatch">
              <Button className="submit-button">Uusi siemenerä</Button>
            </NavLink>
          </Grid.Column>
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

export default SeedBatchsList;