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
  Loader,
  Form,
  Input,
  Message,
  InputOnChangeData
} from "semantic-ui-react";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  seedBatchId: string;
  seedBatch?: SeedBatch;
  onSeedBatchSelected?: (seedBatch: SeedBatch) => void;
  onSeedBatchDeleted?: (seedBatchId: string) => void;
  seeds?: Seed[];
  onSeedsFound?: (seeds: Seed[]) => void;
}

export interface State {
  code: string;
  seedId: string;
  time: string;
  seedBatch?: SeedBatch;
  redirect: boolean;
  saving: boolean;
  messageVisible: boolean;
}

class EditSeedBatch extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      code: "",
      seedId: "",
      time: "",
      seedBatch: undefined,
      redirect: false,
      saving: false,
      messageVisible: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handeNameChange = this.handeNameChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  /**
   * Component did mount life-sycle method
   */
  componentDidMount() {
    new FamiFarmApiClient().findSeedBatch(this.props.keycloak!, this.props.seedBatchId).then((seedBatch) => {
      this.props.onSeedBatchSelected && this.props.onSeedBatchSelected(seedBatch);
      this.setState({seedBatch: seedBatch});
    });
  }

  /**
   * Handle name change
   * 
   * @param event event
   */
  handeNameChange(event: React.FormEvent<HTMLInputElement>) {
    const seedBatch = {
      id: this.state.seedBatch!.id,
      name: [{
        language: "fi",
        value: event.currentTarget.value
      }]
    };

    this.setState({seedBatch: seedBatch});
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
   * 
   * @param event event
   * @param {name, value} name and value
   */
  handleTimeChange = (event: any, {name, value} : any) => {
    this.setState({ time: value });
  }

  /**
   * Handle form submit
   */
  async handleSubmit() {
    this.setState({saving: true});
    await new FamiFarmApiClient().updateSeedBatch(this.props.keycloak!, this.state.seedBatch!);
    this.setState({saving: false});

    this.setState({messageVisible: true});
    setTimeout(() => {
      this.setState({messageVisible: false});
    }, 3000);
  }

  /**
   * Handle seedBatch delete
   */
  handleDelete() {
    const id = this.state.seedBatch!.id;

    new FamiFarmApiClient().deleteSeedBatch(this.props.keycloak!, id!).then(() => {
      this.props.onSeedBatchDeleted && this.props.onSeedBatchDeleted(id!);
      this.setState({redirect: true});
    });
  }

  /**
   * Render edit seedBatch view
   */
  render() {
    if (!this.props.seedBatch) {
      return (
        <Grid style={{paddingTop: "100px"}} centered className="pieru">
          <Loader active size="medium" />
        </Grid>
      );
    }

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
          <Grid.Column width={6}>
            <h2>{this.props.seedBatch!.code}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={this.handleDelete}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
          <Form>
          <Form.Field required>
          <label>{strings.seedBatchCode}</label>
                <Input 
                  value={this.props.seedBatch!.code} 
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
                  value={this.props.seedBatch!.time}
                  iconPosition="left"
                  dateFormat="YYYY-MM-DDTHH:mmZ"
                  onChange={this.handleTimeChange}
                />
          </Form.Field>
            <Message
              success
              visible={this.state.messageVisible}
              header={strings.savedSuccessfully}
            />
            <Button 
              className="submit-button" 
              onClick={this.handleSubmit} 
              type='submit'
              loading={this.state.saving}
            >
                {strings.save}
            </Button>
          </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default EditSeedBatch;