import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { Seed, LocalizedValue } from 'famifarm-client';
import { Redirect } from 'react-router';

import {
  Grid,
  Button,
  Form,
  Input,
  InputOnChangeData
} from "semantic-ui-react";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  seed?: Seed;
  onSeedCreated?: (seed: Seed) => void;
}

export interface State {
  name?: LocalizedValue[];
  redirect: boolean;
  defaultPackageSize: string;
}

class CreateSeed extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
        name: [{
          language: "fi",
          value: ""
        }],
        redirect: false,
        defaultPackageSize: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit() {
    const seedObject = {
      name: this.state.name
    };
    new FamiFarmApiClient().createSeed(this.props.keycloak!, seedObject).then(() => {
      this.setState({redirect: true});
    });
  }

  /**
   * Handle select change
   * 
   * @param e event
   * @param {value} value
   */
  onSelectChange = (e: any, { value }: InputOnChangeData) => {
    this.setState({defaultPackageSize: value});
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to="/seeds" push={true} />;
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>Uusi siemen</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <Form>
              <Form.Field required>
                <label>Siemenen nimi</label>
                <Input 
                  value={this.state.name![0].value} 
                  placeholder='Nimi' 
                  onChange={(e) => this.setState({name: [{language: "fi", value: e.currentTarget.value}]})}
                />
              </Form.Field>
              <Button className="submit-button" onClick={this.handleSubmit} type='submit'>Tallenna</Button>
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default CreateSeed;