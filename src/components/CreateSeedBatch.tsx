import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { SeedBatch, Seed } from "famifarm-typescript-models";
import { Redirect } from 'react-router';
import { DateInput } from 'semantic-ui-calendar-react';;
import strings from "src/localization/strings";
import { FormContainer } from "./FormContainer";

import {
  Grid,
  Button,
  Input,
  InputOnChangeData,
  Form
} from "semantic-ui-react";

interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  seedBatch?: SeedBatch;
  onSeedBatchCreated?: (seedBatch: SeedBatch) => void;
  seeds?: Seed[];
  onSeedsFound?: (seeds: Seed[]) => void,
  onError: (error: ErrorMessage) => void
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

  /**
   * Component did mount life-sycle method
   */
  public async componentDidMount() {
    try {
      if (!this.props.keycloak) {
        return;
      }
  
      const seedsService = await Api.getSeedsService(this.props.keycloak);
      const seeds = await seedsService.listSeeds();
      this.props.onSeedsFound && this.props.onSeedsFound(seeds);
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
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
  private async handleSubmit() {
    try {
      if (!this.props.keycloak) {
        return;
      }
  
      const seedBatchObject = {
        code: this.state.code,
        seedId: this.state.seedId,
        time: this.state.time
      };
  
      const seedBatchService = await Api.getSeedBatchesService(this.props.keycloak);
      await seedBatchService.createSeedBatch(seedBatchObject);
  
      this.setState({redirect: true});
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Render create seed batch view
   */
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
            <FormContainer>
              <Form.Field required>
                <label>{strings.seedBatchCode}</label>
                <Input 
                  value={this.state.code}
                  placeholder={strings.seedBatchCode}
                  onChange={(e) => this.setState({code: e.currentTarget.value})}
                />
              </Form.Field>
              <Form.Select 
                fluid
                required
                value={this.state.seedId}
                label={strings.seed} 
                options={seedOptions} 
                placeholder={strings.seed}
                onChange={this.onSelectChange}
              />
              <Form.Field required>
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
    seedBatches: state.seedBatches,
    seedBatch: state.seedBatch,
    seeds: state.seeds
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onSeedBatchCreated: (seedBatch: SeedBatch) => dispatch(actions.seedBatchCreated(seedBatch)),
    onSeedsFound: (seeds: Seed[]) => dispatch(actions.seedsFound(seeds)),
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateSeedBatch);