import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { Team, LocalizedValue } from 'famifarm-client';
import { Redirect } from 'react-router';
import strings from "src/localization/strings";

import {
  Grid,
  Button,
  Form,
  Input
} from "semantic-ui-react";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  team?: Team;
  onTeamCreated?: (team: Team) => void;
}

export interface State {
  name?: LocalizedValue[];
  redirect: boolean;
}

class EditTeam extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
        name: [{
          language: "fi",
          value: ""
        }],
        redirect: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Handle form submit
   */
  handleSubmit() {
    const teamObject = {
      name: this.state.name
    };
    new FamiFarmApiClient().createTeam(this.props.keycloak!, teamObject).then(() => {
      this.setState({redirect: true});
    });
  }

  /**
   * Handle form submit
   */
  render() {
    if (this.state.redirect) {
      return <Redirect to="/teams" push={true} />;
    }
    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>{strings.newTeam}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <Form>
              <Form.Field required>
                <label>{strings.teamName}</label>
                <Input 
                  value={this.state.name![0].value} 
                  placeholder={strings.teamName} 
                  onChange={(e) => this.setState({name: [{language: "fi", value: e.currentTarget.value}]})}
                />
              </Form.Field>
              <Button className="submit-button" onClick={this.handleSubmit} type='submit'>{strings.save}</Button>
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default EditTeam;