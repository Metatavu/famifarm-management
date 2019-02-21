import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { WastageReason, LocalizedValue } from "famifarm-typescript-models";
import { Redirect } from 'react-router';
import strings from "src/localization/strings";

import {
  Grid,
  Button,
  Form,
  Input
} from "semantic-ui-react";

interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  wastageReason?: WastageReason;
  onWastageReasonCreated?: (wastageReason: WastageReason) => void;
}

interface State {
  reason?: LocalizedValue[];
  redirect: boolean;
}

class CreateWastageReason extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      reason: [{
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
  async handleSubmit() {
    if (!this.props.keycloak) {
      return;
    }

    const wastageReasonObject = {
      reason: this.state.reason
    };

    const wastageReasonService = await Api.getWastageReasonsService(this.props.keycloak);
    wastageReasonService.createWastageReason(wastageReasonObject).then(() => {
      this.setState({redirect: true});
    });
  }

  /**
   * Render create wastageReason view
   */
  render() {
    if (this.state.redirect) {
      return <Redirect to="/wastageReasons" push={true} />;
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
            <Form>
              <Form.Field required>
                <label>{strings.wastageReasonReason}</label>
                <Input 
                  value={this.state.reason![0].value} 
                  placeholder={strings.wastageReasonReason}
                  onChange={(e) => this.setState({reason: [{language: "fi", value: e.currentTarget.value}]})}
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

export default CreateWastageReason;