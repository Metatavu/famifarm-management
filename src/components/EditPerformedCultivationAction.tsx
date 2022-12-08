import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";import Api from "../api";
import { Facility, LocalizedValue, PerformedCultivationAction } from "../generated/client";
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
import { FormContainer } from "./FormContainer";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  facility: Facility;
  performedCultivationActionId: string;
  performedCultivationAction?: PerformedCultivationAction;
  onPerformedCultivationActionSelected?: (performedCultivationAction: PerformedCultivationAction) => void;
  onPerformedCultivationActionDeleted?: (performedCultivationActionId: string) => void;
  onError: (error: ErrorMessage | undefined) => void
}

/**
 * Interface representing component state
 */
interface State {
  performedCultivationAction?: PerformedCultivationAction;
  redirect: boolean;
  saving: boolean;
  messageVisible: boolean;
  open:boolean;
}

/**
 * React component for edit performed cultivation action view
 */
class EditPerformedCultivationAction extends React.Component<Props, State> {

  /**
   * Constructor
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      performedCultivationAction: undefined,
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
    const { performedCultivationActionId, keycloak, facility, onError, onPerformedCultivationActionSelected } = this.props;
    try {
      if (!keycloak) {
        return;
      }
      
      const performedCultivationActionService = await Api.getPerformedCultivationActionsService(keycloak);
      const performedCultivationAction = await performedCultivationActionService.findPerformedCultivationAction({
        performedCultivationActionId: performedCultivationActionId,
        facility: facility
      });
      onPerformedCultivationActionSelected && onPerformedCultivationActionSelected(performedCultivationAction);
      this.setState({performedCultivationAction: performedCultivationAction});

    } catch (e: any) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   *  Updates performed cultivation action name
   * 
   * @param name localized entry representing name
   */
  updateName = (name: LocalizedValue[]) => {
    this.setState({
      performedCultivationAction: {...this.state.performedCultivationAction, name: name}
    });
  }

  /**
   * Handle form submit
   */
  private async handleSubmit() {
    const { keycloak, facility, onError } = this.props;
    const { performedCultivationAction } = this.state;
    try {
      if (!keycloak || !performedCultivationAction) {
        return;
      }
  
      this.setState({saving: true});
  
      const performedCultivationActionService = await Api.getPerformedCultivationActionsService(keycloak);
      await performedCultivationActionService.updatePerformedCultivationAction({
        performedCultivationActionId: performedCultivationAction.id!,
        performedCultivationAction: performedCultivationAction,
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
   * Handle performedCultivationAction delete
   */
  private async handleDelete() {
    const { keycloak, facility, onError, onPerformedCultivationActionDeleted } = this.props;
    const { performedCultivationAction } = this.state;
    try {
      if (!keycloak) {
        return;
      }
  
      const id = performedCultivationAction!.id;
      const performedCultivationActionService = await Api.getPerformedCultivationActionsService(keycloak);
      await performedCultivationActionService.deletePerformedCultivationAction({
        performedCultivationActionId: id!,
        facility: facility
      });
  
      onPerformedCultivationActionDeleted && onPerformedCultivationActionDeleted(id!);
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
   * Render edit performedCultivationAction view
   */
  public render() {
    if (!this.props.performedCultivationAction) {
      return (
        <Grid style={{paddingTop: "100px"}} centered >
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Navigate replace={true} to="/performedCultivationActions"/>;
    }
    const actionName = this.props.performedCultivationAction && this.props.performedCultivationAction.name ? this.props.performedCultivationAction!.name![0].value : "";
    
    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={6}>
            <h2>{actionName}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={()=>this.setState({open:true})}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{strings.performedCultivationActionName}</label>
                <LocalizedValueInput 
                  onValueChange={this.updateName}
                  value={this.state.performedCultivationAction ? this.state.performedCultivationAction.name : undefined}
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
                loading={this.state.saving}
              >
                  {strings.save}
              </Button>
            </FormContainer>
          </Grid.Column>
        </Grid.Row>
        <Confirm open={this.state.open} size={"mini"} content={strings.deleteConfirmationText + actionName} onCancel={()=>this.setState({open:false})} onConfirm={this.handleDelete} />
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
    performedCultivationActions: state.performedCultivationActions,
    performedCultivationAction: state.performedCultivationAction,
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
    onPerformedCultivationActionSelected: (performedCultivationAction: PerformedCultivationAction) => dispatch(actions.performedCultivationActionSelected(performedCultivationAction)),
    onPerformedCultivationActionDeleted: (performedCultivationActionId: string) => dispatch(actions.performedCultivationActionDeleted(performedCultivationActionId)),
    onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditPerformedCultivationAction);