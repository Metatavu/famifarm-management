import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { SeedBatch, Seed } from 'famifarm-client';
import { Redirect } from 'react-router';
import { DateInput } from 'semantic-ui-calendar-react';
import strings from "src/localization/strings";

import {
  Grid,
  Button,
  Form,
  Input,
  InputOnChangeData
} from "semantic-ui-react";

interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  seedBatch?: SeedBatch;
  onSeedBatchCreated?: (seedBatch: SeedBatch) => void;
  seeds?: Seed[];
  onSeedsFound?: (seeds: Seed[]) => void;
}

interface State {
  code: string;
  seedId: string;
  time: string;
  redirect: boolean;
}

class CreateSeedBatch extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
        code: "",
        seedId: "",
        time: "",
        redirect: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    new FamiFarmApiClient().listSeeds(this.props.keycloak!, 0, 100).then((seeds) => {
      this.props.onSeedsFound && this.props.onSeedsFound(seeds);
    });
  }

  /**
   * Handle select change
   * 
   * @param e event
   * @param {value} value
   */
  onSelectChange = (e: any, { value }: InputOnChangeData) => {
    this.setState({seedId: value});
  }

  /**
   * Handle time change
   */
  handleTimeChange = (event: any, {name, value} : any) => {
    this.setState({ time: value });
  }

  handleSubmit() {
    const seedBatchObject = {
      code: this.state.code,
      seedId: this.state.seedId,
      time: this.state.time
    };
    new FamiFarmApiClient().createSeedBatch(this.props.keycloak!, seedBatchObject).then(() => {
      this.setState({redirect: true});
    });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to="/seedBatches" push={true} />;
    }

    const seedOptions = (this.props.seeds || []).map((seed) => {
      return {
        key: seed.id,
        text: seed.name![0].value,
        value: seed.id
      };
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>{strings.newSeedBatch}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <Form>
              <Form.Field required>
                <label>{strings.seedBatchCode}</label>
                <Input 
                  value={this.state.code} 
                  placeholder={strings.seedBatchCode}
                  onChange={(e) => this.setState({code: e.currentTarget.value})}
                />
                <Form.Select 
                  fluid 
                  label={strings.seed} 
                  options={seedOptions} 
                  placeholder={strings.seed}
                  onChange={this.onSelectChange}
                />
                <label>{strings.seedBatchArrived}</label>
                <DateInput
                  name="dateTime"
                  placeholder={strings.date}
                  value={this.state.time}
                  iconPosition="left"
                  dateFormat="YYYY-MM-DDTHH:mmZ"
                  onChange={this.handleTimeChange}
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

export default CreateSeedBatch;