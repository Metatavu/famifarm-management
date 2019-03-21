import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { Seed, SeedOpt, LocalizedEntry } from "famifarm-typescript-models";
import { Redirect } from 'react-router';
import strings from "src/localization/strings";

import {
  Grid,
  Button,
  Form,
} from "semantic-ui-react";
import LocalizedValueInput from "./LocalizedValueInput";

/**
 * Component props
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  seed?: Seed;
  onSeedCreated?: (seed: Seed) => void;
}

/**
 * Component state
 */
interface State {
  seedData: SeedOpt
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
  async handleSubmit() {
    if (!this.props.keycloak) {
      return;
    }

    const seedObject: Seed = {
      name: this.state.seedData.name
    };

    const seedService = await Api.getSeedsService(this.props.keycloak);
    seedService.createSeed(seedObject).then(() => {
      this.setState({redirect: true});
    });
  }

  /**
   * Updates seed name
   * 
   * @param name localized entry representing name
   */
  updateName = (name: LocalizedEntry) => {
    this.setState({
      seedData: {...this.state.seedData, name: name}
    });
  }

  /**
   * Render create seed view
   */
  render() {
    if (this.state.redirect) {
      return <Redirect to="/seeds" push={true} />;
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
            <Form>
              <label>{strings.seedName}</label>
              <LocalizedValueInput 
                onValueChange={this.updateName}
                value={this.state.seedData.name}
                languages={["fi", "en"]}
              />
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
    seeds: state.seeds,
    seed: state.seed
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onSeedCreated: (seed: Seed) => dispatch(actions.seedCreated(seed))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateSeed);