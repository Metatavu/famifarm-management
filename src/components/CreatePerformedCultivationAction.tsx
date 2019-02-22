import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { PerformedCultivationAction, PerformedCultivationActionOpt, LocalizedEntry } from "famifarm-typescript-models";
import { Redirect } from 'react-router';
import strings from "src/localization/strings";

import {
  Grid,
  Button,
  Form,
} from "semantic-ui-react";
import LocalizedValueInput from "./LocalizedValueInput";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  performedCultivationAction?: PerformedCultivationAction;
  onPerformedCultivationActionCreated?: (performedCultivationAction: PerformedCultivationAction) => void;
}

export interface State {
  performedCultivationActionData: PerformedCultivationActionOpt
  redirect: boolean;
}

class EditPerformedCultivationAction extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      performedCultivationActionData: {},
      redirect: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Handle form submit
   */
  async handleSubmit() {
    if (!this.props.keycloak) {
      return
    }

    const performedCultivationActionObject: PerformedCultivationAction = {
      name: this.state.performedCultivationActionData.name
    };

    const performedCultivationActionService = await Api.getPerformedCultivationActionsService(this.props.keycloak);
    performedCultivationActionService.createPerformedCultivationAction(performedCultivationActionObject).then(() => {
      this.setState({redirect: true});
    });
  }

  /**
   *  Updates performed cultivation action name
   * 
   * @param name localized entry representing name
   */
  updateName = (name: LocalizedEntry) => {
    this.setState({
      performedCultivationActionData: {...this.state.performedCultivationActionData, name: name}
    });
  }

  /**
   * Render create performed cultivation action view
   */
  render() {
    if (this.state.redirect) {
      return <Redirect to="/performedCultivationActions" push={true} />;
    }
    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>{strings.newPerformedCultivationAction}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <Form>
              <Form.Field required>
                <label>{strings.performedCultivationActionName}</label>
                <LocalizedValueInput 
                  onValueChange={this.updateName}
                  value={this.state.performedCultivationActionData.name}
                  languages={["fi", "en"]}
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