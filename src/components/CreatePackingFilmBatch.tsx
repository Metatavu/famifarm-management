import * as React from "react";
import Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { Facility, PackagingFilmBatch } from "../generated/client"; // Changed to PackingFilmBatch and PackingFilm
import { Navigate } from 'react-router-dom';
import { DateInput } from 'semantic-ui-calendar-react';
import strings from "../localization/strings";
import { FormContainer } from "./FormContainer";
import moment from "moment";

import {
  Grid,
  Button,
  Input,
  Form
} from "semantic-ui-react";

const DATE_FORMAT = "DD.MM.YYYY";

interface Props {
  keycloak?: Keycloak;
  facility: Facility;
  onError: (error: ErrorMessage | undefined) => void;
}

interface State {
  name: string;
  id: string;
  time: string;
  redirect: boolean;
}

class CreatePackingFilmBatch extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
        name: "",
        id: "", 
        time: moment().format(DATE_FORMAT),
        redirect: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
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
    const { name, time } = this.state;
    try {
      if (!keycloak) {
        return;
      }

      const packingFilmBatchObject: PackagingFilmBatch = {
        name: name, // Generating new UUID for the packing film batch
        time: moment(time, DATE_FORMAT).toDate(),
        active: true
      };

      const packingFilmBatchService = await Api.getPackagingFilmBatchesService(keycloak); 
      await packingFilmBatchService.createPackagingFilmBatch({
        packagingFilmBatch: packingFilmBatchObject,
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
   * Render create packing film batch view
   */
  render() {
    if (this.state.redirect) {
      return <Navigate to="/packingFilmBatches" replace={true} />; // Changed route
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>{strings.packagingFilm.newPackingFilmBatch}</h2> {/* Add new string to localization */}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{strings.packagingFilm.packingFilmBatchName}</label> {/* Add new string to localization */}
                <Input
                  value={this.state.name}
                  placeholder={strings.packagingFilm.packingFilmBatchName} // Add new string to localization
                  onChange={(e) => this.setState({name: e.currentTarget.value})}
                />
              </Form.Field>
              <Form.Field required>
                <label>{strings.packagingFilm.packingFilmBatchArrived}</label> {/* Add new string to localization */}
                <DateInput
                  name="dateTime"
                  placeholder={strings.date}
                  value={this.state.time}
                  iconPosition="left"
                  dateFormat={DATE_FORMAT}
                  localization="fi-FI"
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
    onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePackingFilmBatch);