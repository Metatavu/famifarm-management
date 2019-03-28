import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
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
  onPerformedCultivationActionCreated?: (performedCultivationAction: PerformedCultivationAction) => void,
  onError: (error: ErrorMessage) => void
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
  public async handleSubmit() {
    try {
      if (!this.props.keycloak) {
        return
      }
  
      const performedCultivationActionObject: PerformedCultivationAction = {
        name: this.state.performedCultivationActionData.name
      };
  
      const performedCultivationActionService = await Api.getPerformedCultivationActionsService(this.props.keycloak);
      await performedCultivationActionService.createPerformedCultivationAction(performedCultivationActionObject)
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
   *  Updates performed cultivation action name
   * 
   * @param name localized entry representing name
   */
  private updateName = (name: LocalizedEntry) => {
    this.setState({
      performedCultivationActionData: {...this.state.performedCultivationActionData, name: name}
    });
  }

  /**
   * Render create performed cultivation action view
   */
  public render() {
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

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    performedCultivationActions: state.performedCultivationActions,
    performedCultivationAction: state.performedCultivationAction
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onPerformedCultivationActionCreated: (performedCultivationAction: PerformedCultivationAction) => dispatch(actions.performedCultivationActionCreated(performedCultivationAction)),
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditPerformedCultivationAction);