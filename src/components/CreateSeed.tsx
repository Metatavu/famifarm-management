import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { Facility, LocalizedValue, Seed } from "../generated/client";
import { Navigate } from 'react-router-dom';
import strings from "../localization/strings";

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
  keycloak?: Keycloak.KeycloakInstance;
  seed?: Seed;
  facility: Facility;
  onSeedCreated?: (seed: Seed) => void,
  onError: (error: ErrorMessage | undefined) => void
}

/**
 * Component state
 */
interface State {
  seedData: Seed;
  redirect: boolean;
}

class CreateSeed extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      seedData: {},
      redirect: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Handle form submit
   */
  private async handleSubmit() {
    const { keycloak, facility, onError } = this.props;
    const { seedData } = this.state;
    try {
      if (!keycloak) {
        return;
      }
  
      const seedObject: Seed = {
        name: seedData.name
      };
  
      const seedService = await Api.getSeedsService(keycloak);
      await seedService.createSeed({
        seed: seedObject,
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
   * Updates seed name
   * 
   * @param name localized entry representing name
   */
  updateName = (name: LocalizedValue[]) => {
    this.setState({
      seedData: {...this.state.seedData, name: name}
    });
  }

  /**
   * Render create seed view
   */
  render() {
    if (this.state.redirect) {
      return <Navigate replace={true} to="/seeds"/>;
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>{strings.newSeed}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{strings.seedName}</label>
                <LocalizedValueInput 
                  onValueChange={this.updateName}
                  value={this.state.seedData.name}
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
    seeds: state.seeds,
    seed: state.seed,
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
    onSeedCreated: (seed: Seed) => dispatch(actions.seedCreated(seed)),
    onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateSeed);