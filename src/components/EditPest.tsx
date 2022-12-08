import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { Facility, LocalizedValue, Pest } from "../generated/client";
import { Navigate } from 'react-router-dom';
import strings from "../localization/strings";

import {
  Grid,
  Button,
  Loader,
  Form,
  Message,
  Confirm
} from "semantic-ui-react";
import LocalizedValueInput from "./LocalizedValueInput";
import LocalizedUtils from "../localization/localizedutils";
import { ErrorMessage } from "../types";
import { FormContainer } from "./FormContainer";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  pestId: string;
  facility: Facility;
  onError: (error: ErrorMessage | undefined) => void;
}

/**
 * Interface representing component state
 */
interface State {
  pest?: Pest;
  redirect: boolean;
  saving: boolean;
  messageVisible: boolean;
  open: boolean;
}

/**
 * React component for edit pest view
 */
class EditPest extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      pest: undefined,
      redirect: false,
      saving: false,
      messageVisible: false,
      open:false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  /**
   * Component did mount life-sycle method
   */
  public async componentDidMount() {
    const { pestId, keycloak, facility, onError } = this.props;
    try {
      if (!keycloak) {
        return;
      }
  
      const pestsService = await Api.getPestsService(keycloak);
      const pest = await pestsService.findPest({
        pestId: pestId,
        facility: facility
      });
      this.setState({pest: pest});

    } catch (e: any) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }


  /**
   * Updates pest name
   * 
   * @param name localized entry representing name
   */
  updateName = (name: LocalizedValue[]) => {
    this.setState({
      pest: {...this.state.pest, name: name}
    });
  }

  /**
   * Handle form submit
   */
  private async handleSubmit() {
    const { keycloak, facility, onError } = this.props;
    const { pest } = this.state;
    try {
      if (!keycloak || !pest) {
        return;
      }
  
      const pestsService = await Api.getPestsService(keycloak);
  
      this.setState({saving: true});
      await pestsService.updatePest({
        pestId: pest.id!,
        pest: pest,
        facility: facility
      });
      this.setState({saving: false});
  
      this.setState({messageVisible: true});
      setTimeout(() => {
        this.setState({messageVisible: false});
      }, 3000);
    } catch (e: any) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Handle pest delete
   */
  private async handleDelete() {
    const { keycloak, facility, onError } = this.props;
    const { pest } = this.state;
    try {
      if (!keycloak || !pest) {
        return;
      }
  
      const pestsService = await Api.getPestsService(keycloak);
      const id = pest.id || "";
      await pestsService.deletePest({
        pestId: id,
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
   * Render edit pest view
   */
  public render() {
    if (!this.state.pest) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Navigate replace={true} to="/pests"/>;
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={6}>
            <h2>{LocalizedUtils.getLocalizedValue(this.state.pest.name)}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={()=>this.setState({open:true})}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
          <FormContainer>
            <Form.Field required>
              <label>{strings.pestName}</label>
              <LocalizedValueInput 
                onValueChange={this.updateName}
                value={this.state.pest ? this.state.pest.name : undefined}
                languages={["fi", "en"]}
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
              loading={this.state.saving} >
                {strings.save}
            </Button>
          </FormContainer>
          </Grid.Column>
        </Grid.Row>
        <Confirm
          open={this.state.open}
          size={"mini"}
          content={strings.formatString(strings.deleteConfirmationText, LocalizedUtils.getLocalizedValue(this.state.pest.name))}
          onCancel={()=>this.setState({open:false})}
          onConfirm={this.handleDelete} />
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

export default connect(mapStateToProps, mapDispatchToProps)(EditPest);