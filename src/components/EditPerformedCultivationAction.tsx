import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { PerformedCultivationAction } from "famifarm-typescript-models";
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
  performedCultivationActionId: string;
  performedCultivationAction?: PerformedCultivationAction;
  onPerformedCultivationActionSelected?: (performedCultivationAction: PerformedCultivationAction) => void;
  onPerformedCultivationActionDeleted?: (performedCultivationActionId: string) => void;
}

export interface State {
  performedCultivationAction?: PerformedCultivationAction;
  redirect: boolean;
}

class EditPerformedCultivationAction extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
        performedCultivationAction: undefined,
        redirect: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handeNameChange = this.handeNameChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  /**
   * Component did mount life-sycle method
   */
  async componentDidMount() {
    if (!this.props.keycloak) {
      return;
    }
    
    const performedCultivationActionService = await Api.getPerformedCultivationActionsService(this.props.keycloak);
    performedCultivationActionService.findPerformedCultivationAction(this.props.performedCultivationActionId).then((performedCultivationAction) => {
      this.props.onPerformedCultivationActionSelected && this.props.onPerformedCultivationActionSelected(performedCultivationAction);
      this.setState({performedCultivationAction: performedCultivationAction});
    });
  }

  /**
   * Handle name change
   * 
   * @param event event
   */
  handeNameChange(event: React.FormEvent<HTMLInputElement>) {
    const performedCultivationAction = {
      id: this.state.performedCultivationAction!.id,
      name: [{
        language: "fi",
        value: event.currentTarget.value
      }]
    };

    this.setState({performedCultivationAction: performedCultivationAction});
  }

  /**
   * Handle form submit
   */
  async handleSubmit() {
    if (!this.props.keycloak || !this.state.performedCultivationAction) {
      return;
    }

    const performedCultivationActionService = await Api.getPerformedCultivationActionsService(this.props.keycloak);
    performedCultivationActionService.updatePerformedCultivationAction(this.state.performedCultivationAction, this.state.performedCultivationAction.id!);
  }

  /**
   * Handle performedCultivationAction delete
   */
  async handleDelete() {
    if (!this.props.keycloak) {
      return;
    }

    const id = this.state.performedCultivationAction!.id;
    const performedCultivationActionService = await Api.getPerformedCultivationActionsService(this.props.keycloak);
    performedCultivationActionService.deletePerformedCultivationAction(id!).then(() => {
      this.props.onPerformedCultivationActionDeleted && this.props.onPerformedCultivationActionDeleted(id!);
      this.setState({redirect: true});
    });
  }

  /**
   * Render edit performedCultivationAction view
   */
  render() {
    if (!this.props.performedCultivationAction) {
      return (
        <Grid style={{paddingTop: "100px"}} centered className="pieru">
          <Loader active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Redirect to="/performedCultivationActions" push={true} />;
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={6}>
            <h2>{this.props.performedCultivationAction!.name![0].value}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={this.handleDelete}>{strings.deletePerformedCultivationAction}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
          <Form>
          <Form.Field required>
            <label>{strings.performedCultivationActionName}</label>
            <Input 
              value={this.state.performedCultivationAction && this.state.performedCultivationAction!.name![0].value} 
              placeholder={strings.performedCultivationActionName}
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

export default EditPerformedCultivationAction;