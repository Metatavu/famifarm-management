import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { Team } from 'famifarm-client';
import { Redirect } from 'react-router';
import strings from "src/localization/strings";

import {
  Grid,
  Button,
  Loader,
  Form,
  Input
} from "semantic-ui-react";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  teamId: string;
  team?: Team;
  onTeamSelected?: (team: Team) => void;
  onTeamDeleted?: (teamId: string) => void;
}

export interface State {
  team?: Team;
  redirect: boolean;
}

class EditTeam extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
        team: undefined,
        redirect: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handeNameChange = this.handeNameChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  /**
   * Component did mount life-sycle method
   */
  componentDidMount() {
    new FamiFarmApiClient().findTeam(this.props.keycloak!, this.props.teamId).then((team) => {
      this.props.onTeamSelected && this.props.onTeamSelected(team);
      this.setState({team: team});
    });
  }

  /**
   * Handle name change
   * 
   * @param event event
   */
  handeNameChange(event: React.FormEvent<HTMLInputElement>) {
    const team = {
      id: this.state.team!.id,
      name: [{
        language: "fi",
        value: event.currentTarget.value
      }]
    };

    this.setState({team: team});
  }

  /**
   * Handle form submit
   */
  async handleSubmit() {
    await new FamiFarmApiClient().updateTeam(this.props.keycloak!, this.state.team!);
  }

  /**
   * Handle team delete
   */
  handleDelete() {
    const id = this.state.team!.id;

    new FamiFarmApiClient().deleteTeam(this.props.keycloak!, id!).then(() => {
      this.props.onTeamDeleted && this.props.onTeamDeleted(id!);
      this.setState({redirect: true});
    });
  }

  /**
   * Render edit team view
   */
  render() {
    if (!this.props.team) {
      return (
        <Grid style={{paddingTop: "100px"}} centered className="pieru">
          <Loader active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Redirect to="/teams" push={true} />;
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={6}>
            <h2>{this.props.team!.name![0].value}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={this.handleDelete}>{strings.deleteTeam}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
          <Form>
          <Form.Field required>
            <label>{strings.teamName}</label>
            <Input 
              value={this.state.team && this.state.team!.name![0].value} 
              placeholder={strings.teamName}
              onChange={this.handeNameChange}
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