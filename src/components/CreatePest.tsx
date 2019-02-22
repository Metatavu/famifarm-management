import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { Pest, PestOpt, LocalizedEntry } from "famifarm-typescript-models";
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
  pest?: Pest;
}

/**
 * Component state
 */
interface State {
  pestData: PestOpt
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
  async handleSubmit() {
    if (!this.props.keycloak) {
      return;
    }

    const pestObject: Pest = {
      name: this.state.pestData.name
    };

    const pestService = await Api.getPestsService(this.props.keycloak);
    pestService.createPest(pestObject).then(() => {
      this.setState({redirect: true});
    });
  }

  /**
   * Updates pest name
   * 
   * @param name localized entry representing name
   */
  updateName = (name: LocalizedEntry) => {
    this.setState({
      pestData: {...this.state.pestData, name: name}
    });
  }

  /**
   * Render create pest view
   */
  render() {
    if (this.state.redirect) {
      return <Redirect to="/pests" push={true} />;
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
            <Form>
              <label>{strings.pestName}</label>
              <LocalizedValueInput 
                onValueChange={this.updateName}
                value={this.state.pestData.name}
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

export default CreatePest;