import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { PerformedCultivationAction, LocalizedValue } from 'famifarm-client';
import { Redirect } from 'react-router';
import strings from "src/localization/strings";

import {
  Grid,
  Button,
  Form,
  Input
} from "semantic-ui-react";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  performedCultivationAction?: PerformedCultivationAction;
  onPerformedCultivationActionCreated?: (performedCultivationAction: PerformedCultivationAction) => void;
}

export interface State {
  name?: LocalizedValue[];
  redirect: boolean;
}

class EditPerformedCultivationAction extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
        name: [{
          language: "fi",
          value: ""
        }],
        redirect: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Handle form submit
   */
  handleSubmit() {
    const performedCultivationActionObject = {
      name: this.state.name
    };
    new FamiFarmApiClient().createPerformedCultivationAction(this.props.keycloak!, performedCultivationActionObject).then(() => {
      this.setState({redirect: true});
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
                <Input 
                  value={this.state.name![0].value} 
                  placeholder={strings.performedCultivationActionName} 
                  onChange={(e) => this.setState({name: [{language: "fi", value: e.currentTarget.value}]})}
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