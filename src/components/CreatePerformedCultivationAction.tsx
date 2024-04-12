import * as React from "react";
import Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { Facility, LocalizedValue, PerformedCultivationAction } from "../generated/client";
import { Navigate } from 'react-router-dom';
import strings from "../localization/strings";

import {
  Grid,
  Button,
  Form,
} from "semantic-ui-react";
import LocalizedValueInput from "./LocalizedValueInput";
import { FormContainer } from "./FormContainer";

export interface Props {
  keycloak?: Keycloak;
  performedCultivationAction?: PerformedCultivationAction;
  facility: Facility;
  onPerformedCultivationActionCreated?: (performedCultivationAction: PerformedCultivationAction) => void;
  onError: (error: ErrorMessage | undefined) => void;
}

export interface State {
  performedCultivationActionData: PerformedCultivationAction
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
    const { keycloak, facility, onError } = this.props;
    const { performedCultivationActionData } = this.state;
    try {
      if (!keycloak) {
        return
      }
  
      const performedCultivationActionObject: PerformedCultivationAction = {
        name: performedCultivationActionData.name
      };
  
      const performedCultivationActionService = await Api.getPerformedCultivationActionsService(keycloak);
      await performedCultivationActionService.createPerformedCultivationAction({
        performedCultivationAction: performedCultivationActionObject,
        facility: facility
      });
      this.setState({redirect: true});
    } catch (e: any) {
      onError({
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
  private updateName = (name: LocalizedValue[]) => {
    this.setState({
      performedCultivationActionData: {...this.state.performedCultivationActionData, name: name}
    });
  }

  /**
   * Render create performed cultivation action view
   */
  public render() {
    if (this.state.redirect) {
      return <Navigate replace={true} to="/performedCultivationActions"/>;
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
            <FormContainer>
              <Form.Field required>
                <label>{strings.performedCultivationActionName}</label>
                <LocalizedValueInput 
                  onValueChange={this.updateName}
                  value={this.state.performedCultivationActionData.name}
                  languages={["fi", "en"]}
                />
              </Form.Field>
              <Button className="submit-button" onClick={this.handleSubmit} type='submit'>{strings.save}</Button>
            </FormContainer>
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
    performedCultivationAction: state.performedCultivationAction,
    facility: state.facility
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
     onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditPerformedCultivationAction);