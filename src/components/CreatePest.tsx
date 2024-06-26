import * as React from "react";
import Keycloak from 'keycloak-js';
import Api from "../api";
import { Facility, LocalizedValue, Pest } from "../generated/client";
import { Navigate } from 'react-router-dom';
import strings from "../localization/strings";
import * as actions from "../actions";
import { StoreState, ErrorMessage } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  Grid,
  Button,
  Form,
} from "semantic-ui-react";
import LocalizedValueInput from "./LocalizedValueInput";
import { FormContainer } from "./FormContainer";

/**
 * Component props
 */
interface Props {
  keycloak?: Keycloak;
  pest?: Pest;
  facility: Facility;
  onError: (error: ErrorMessage | undefined) => void;
}

/**
 * Component state
 */
interface State {
  pestData: Pest
  redirect: boolean;
}

class CreatePest extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pestData: {},
      redirect: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Handle form submit
   */
  private async handleSubmit() {
    const { keycloak, facility, onError } = this.props;
    const { pestData } = this.state;
    try {
      if (!keycloak) {
        return;
      }
  
      const pestObject: Pest = {
        name: pestData.name
      };
  
      const pestService = await Api.getPestsService(keycloak);
      await pestService.createPest({
        pest: pestObject,
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
   * Updates pest name
   * 
   * @param name localized entry representing name
   */
  updateName = (name: LocalizedValue[]) => {
    this.setState({
      pestData: {...this.state.pestData, name: name}
    });
  }

  /**
   * Render create pest view
   */
  render() {
    if (this.state.redirect) {
      return <Navigate replace={true} to="/pests"/>;
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>{strings.newPest}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{strings.pestName}</label>
                <LocalizedValueInput 
                  onValueChange={this.updateName}
                  value={this.state.pestData.name}
                  languages={["fi", "en"]}
                />
                <Button className="submit-button" onClick={this.handleSubmit} type='submit'>{strings.save}</Button>
              </Form.Field>
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
     onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePest);