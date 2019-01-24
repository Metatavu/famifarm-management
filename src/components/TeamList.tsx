import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { NavLink } from 'react-router-dom';
import { Team } from 'famifarm-client';

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  teams?: Team[];
  onTeamsFound?: (teams: Team[]) => void;
}

export interface State {
  teams: Team[];
}

class TeamsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
        teams: []
    };
  }

  componentDidMount() {
    new FamiFarmApiClient().listTeams(this.props.keycloak!, 0, 100).then((teams) => {
      this.props.onTeamsFound && this.props.onTeamsFound(teams);
    });
  }

  render() {
    if (!this.props.teams) {
      console.log(this.props.teams);
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader active size="medium" />
        </Grid>
      );
    }

    const teams = this.props.teams.map((team) => {
      const teamPath = `/teams/${team.id}`;
      return (
        <List.Item>
          <List.Content floated='right'>
            <NavLink to={teamPath}>
              <Button className="submit-button">Avaa</Button>
            </NavLink>
          </List.Content>
          <List.Header>{team.name![0].value}</List.Header>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={3}>
            <h2>Tiimit</h2>
          </Grid.Column>
          <Grid.Column width={2} floated="right">
            <NavLink to="/createTeam">
              <Button className="submit-button">Uusi tiimi</Button>
            </NavLink>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List>
              {teams}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default TeamsList;