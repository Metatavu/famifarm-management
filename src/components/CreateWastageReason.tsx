import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";import Api from "../api";
import { LocalizedValue, WastageReason } from "../generated/client";
import { redirect } from 'react-router-dom';
import strings from "../localization/strings";

import {
  Grid,
  Button,
  Form,
} from "semantic-ui-react";
import LocalizedValueInput from "./LocalizedValueInput";
import { FormContainer } from "./FormContainer";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  onWastageReasonCreated?: (wastageReason: WastageReason) => void,
   onError: (error: ErrorMessage | undefined) => void
}

/**
 * Interface representing component state
 */
interface State {
  redirect: boolean;
  wastageReasonData: WastageReason
}

class CreateWastageReason extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      wastageReasonData: {},
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
  
      const wastageReasonObject: WastageReason = {
        reason: this.state.wastageReasonData.reason
      };
  
      const wastageReasonService = await Api.getWastageReasonsService(this.props.keycloak);
      await wastageReasonService.createWastageReason({wastageReason: wastageReasonObject});
      
      this.setState({redirect: true});
    } catch (e: any) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Updates reason text
   * 
   * @param reason localized entry representing reason
   */
  private updateReason = (reason: LocalizedValue[]) => {
    this.setState({
      wastageReasonData: {...this.state.wastageReasonData, reason: reason}
    });
  }

  /**
   * Render create wastageReason view
   */
  public render() {
    if (this.state.redirect) {
      redirect("/wastageReasons");
      return null;
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>{strings.newWastageReason}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{strings.wastageReasonReason}</label>
                <LocalizedValueInput 
                  onValueChange={this.updateReason}
                  value={this.state.wastageReasonData.reason}
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
    wastageReasons: state.wastageReasons,
    wastageReason: state.wastageReason
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onWastageReasonCreated: (wastageReason: WastageReason) => dispatch(actions.wastageReasonCreated(wastageReason)),
     onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateWastageReason);