import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { NavLink } from 'react-router-dom';
import { Team } from 'famifarm-client';
import strings from "src/localization/strings";

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

  /**
   * Component did mount life-sycle event
   */
  componentDidMount() {
    new FamiFarmApiClient().listTeams(this.props.keycloak!, 0, 100).then((teams) => {
      this.props.onTeamsFound && this.props.onTeamsFound(teams);
    });
  }

  /**
   * Render team list view
   */
  render() {
    if (!this.props.teams) {
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
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Header>{team.name![0].value}</List.Header>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.teams}</h2>
          <NavLink to="/createTeam">
            <Button className="submit-button">{strings.newTeam}</Button>
          </NavLink>
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