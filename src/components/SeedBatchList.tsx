import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { NavLink } from 'react-router-dom';
import { SeedBatch } from 'famifarm-client';
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

class SeedBatchsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      seedBatches: []
    };
  }

  /**
   * Component did mount life-cycle event
   */
  componentDidMount() {
    new FamiFarmApiClient().listSeedBatches(this.props.keycloak!, 0, 100).then((seedBatches) => {
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
        <List.Item>
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

export default SeedBatchsList;