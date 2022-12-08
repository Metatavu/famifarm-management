import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { SeedBatch, Seed, Facility } from "../generated/client";
import { Navigate } from 'react-router-dom';
import { DateInput } from 'semantic-ui-calendar-react';
import strings from "../localization/strings";
import { FormContainer } from "./FormContainer";
import moment from "moment";

import {
  Grid,
  Button,
  Input,
  DropdownProps,
  Form
} from "semantic-ui-react";

const DATE_FORMAT = "DD.MM.YYYY";

interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  seedBatch?: SeedBatch;
  facility: Facility;
  onSeedBatchCreated?: (seedBatch: SeedBatch) => void;
  seeds?: Seed[];
  onSeedsFound?: (seeds: Seed[]) => void;
  onError: (error: ErrorMessage | undefined) => void;
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
        time: moment().format(DATE_FORMAT),
        redirect: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Component did mount life-sycle method
   */
  public async componentDidMount() {
    const { keycloak, facility, onSeedsFound, onError } = this.props;
    try {
      if (!keycloak) {
        return;
      }
  
      const seedsService = await Api.getSeedsService(keycloak);
      const seeds = await seedsService.listSeeds({ facility: facility });
      onSeedsFound && onSeedsFound(seeds);
    } catch (e: any) {
      onError({
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
  onSelectChange = (e: any, { value }: DropdownProps) => {
    this.setState({seedId: value as string});
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
    const { keycloak, facility, onError } = this.props;
    const { code, seedId, time } = this.state;
    try {
      if (!keycloak) {
        return;
      }
  
      const seedBatchObject = {
        code: code,
        seedId: seedId,
        time: moment(time, DATE_FORMAT).toDate()
      };
  
      const seedBatchService = await Api.getSeedBatchesService(keycloak);
      await seedBatchService.createSeedBatch({
        seedBatch: seedBatchObject,
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
   * Render create seed batch view
   */
  render() {
    if (this.state.redirect) {
      return <Navigate to="/seedBatches" replace={true} />;
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
                  dateFormat={DATE_FORMAT}
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
    seeds: state.seeds,
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
    onSeedBatchCreated: (seedBatch: SeedBatch) => dispatch(actions.seedBatchCreated(seedBatch)),
    onSeedsFound: (seeds: Seed[]) => dispatch(actions.seedsFound(seeds)),
    onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateSeedBatch);