import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { Team, LocalizedValue } from "famifarm-typescript-models";
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
  onTeamCreated?: (team: Team) => void,
  onError: (error: ErrorMessage) => void
}

export interface State {
  name?: LocalizedValue[];
  redirect: boolean;
}

class CreateTeam extends React.Component<Props, State> {
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
  private async handleSubmit() {
    try {
      if (!this.props.keycloak) {
        return;
      }
  
      const teamObject = {
        name: this.state.name
      };
  
      const teamsService = await Api.getTeamsService(this.props.keycloak);
      await teamsService.createTeam(teamObject);
      this.setState({redirect: true});
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Handle form submit
   */
  public render() {
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

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    teams: state.teams,
    team: state.team
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onTeamCreated: (team: Team) => dispatch(actions.teamCreated(team)),
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateTeam);