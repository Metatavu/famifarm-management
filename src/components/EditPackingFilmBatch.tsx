import * as React from "react";
import Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { PackagingFilmBatch, Facility } from "../generated/client";
import { Navigate } from 'react-router-dom';
import { DateInput } from 'semantic-ui-calendar-react';
import strings from "../localization/strings";
import {
  Grid,
  Button,
  Loader,
  Form,
  Input,
  Message,
  Confirm,
  Checkbox
} from "semantic-ui-react";
import { FormContainer } from "./FormContainer";
import moment from "moment";

const DATE_FORMAT = "DD.MM.YYYY";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak: Keycloak;
  packingFilmBatchId: string;
  facility: Facility;
  onError: (error: ErrorMessage | undefined) => void;
}
/**
 * Interface representing component state
 */
interface State {
  name: string;
  id: string;
  time: string;
  packagingFilmBatch?: PackagingFilmBatch;
  redirect: boolean;
  saving: boolean;
  messageVisible: boolean;
  open: boolean;
}
/**
 * React component for edit packaging film batch view
 */
class EditPackagingFilmBatch extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      name: "",
      id: "",
      time: "",
      packagingFilmBatch: undefined,
      redirect: false,
      saving: false,
      messageVisible: false,
      open: false
    };
  }

  public async componentDidMount() {
    const { keycloak, facility, onError } = this.props;
    try {
      if (!keycloak) {
        return;
      }
      const packagingFilmBatchesService = await Api.getPackagingFilmBatchesService(keycloak);
      const packagingFilmBatch = await packagingFilmBatchesService.findPackagingFilmBatch({
        packagingFilmBatchId: this.props.packingFilmBatchId,
        facility: facility
      });
      this.setState({ packagingFilmBatch: packagingFilmBatch, name: packagingFilmBatch.name ?? "" });
    } catch (e: any) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  private async handleSubmit() {
    const { keycloak, facility, onError } = this.props;
    try {
      if (!keycloak || !this.state.packagingFilmBatch || !this.state.packagingFilmBatch.id) {
        return;
      }
      const packagingFilmBatchesService = await Api.getPackagingFilmBatchesService(keycloak);
      this.setState({ saving: true });

      await packagingFilmBatchesService.updatePackagingFilmBatch({
        packagingFilmBatchId: this.state.packagingFilmBatch.id,
        packagingFilmBatch: { ...this.state.packagingFilmBatch, name: this.state.name },
        facility: facility
      });
      this.setState({ saving: false });
      this.setState({ messageVisible: true });
      setTimeout(() => {
        this.setState({ messageVisible: false });
      }, 3000);
    } catch (e: any) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  private async handleDelete() {
    const { keycloak, facility, onError } = this.props;
    try {
      if (!keycloak || !this.state.packagingFilmBatch || !this.state.packagingFilmBatch.id) {
        return;
      }
      const packagingFilmBatchesService = await Api.getPackagingFilmBatchesService(keycloak);
      const id = this.state.packagingFilmBatch.id;
      await packagingFilmBatchesService.deletePackagingFilmBatch({
        packagingFilmBatchId: id,
        facility: facility
      });
      this.setState({ redirect: true });
    } catch (e: any) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  public render() {
    if (!this.state.packagingFilmBatch) {
      return (
        <Grid style={{ paddingTop: "100px" }} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }
    if (this.state.redirect) {
      return <Navigate to="/packingFilmBatches" replace={true} />;
    }
    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={6}>
            <h2>{this.state.packagingFilmBatch.name}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={() => this.setState({ open: true })}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{strings.packagingFilm.packingFilmBatchName}</label>
                <Input
                  value={this.state.name ? this.state.name : ""}
                  placeholder={strings.packagingFilm.packingFilmBatchName}
                  onChange={(_, data) => this.setState(prevState => ({
                    name: data.value,
                  }))}
                />
              </Form.Field>
              <Form.Field required>
                <label>{strings.packagingFilm.packingFilmBatchArrived}</label>
                <DateInput
                  name="dateTime"
                  placeholder={strings.date}
                  value={this.state.packagingFilmBatch ? moment(this.state.packagingFilmBatch.time).format(DATE_FORMAT) : ""}
                  iconPosition="left"
                  dateFormat={DATE_FORMAT}
                  localization="fi-FI"
                  onChange={(_, data) => this.setState(prevState => ({
                    packagingFilmBatch: {
                      ...prevState.packagingFilmBatch,
                      time: moment((data).value, DATE_FORMAT).toDate()
                    }
                  }))}
                />
              </Form.Field>
              <Form.Field>
                <Checkbox
                  label={strings.packagingFilm.packagingFilmBatchState}
                  onChange={(_, data) => this.setState(prevState => ({
                    packagingFilmBatch: {
                      ...prevState.packagingFilmBatch,
                      active: data.checked
                    }
                  }))}
                  checked={this.state.packagingFilmBatch ? this.state.packagingFilmBatch.active : false}
                />
              </Form.Field>
              <Message
                success
                visible={this.state.messageVisible}
                header={strings.savedSuccessfully}
              />
              <Button
                className="submit-button"
                onClick={() => this.handleSubmit()}
                type='submit'
                loading={this.state.saving}
              >
                {strings.save}
              </Button>
            </FormContainer>
          </Grid.Column>
        </Grid.Row>
        <Confirm
          open={this.state.open}
          size={"mini"}
          content={strings.deleteConfirmationText + this.state.packagingFilmBatch.name}
          onCancel={() => this.setState({ open: false })}
          onConfirm={() => this.handleDelete()} />
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

export default connect(mapStateToProps, mapDispatchToProps)(EditPackagingFilmBatch);
