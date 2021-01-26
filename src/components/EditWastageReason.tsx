import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";import Api from "../api";
import { LocalizedValue, WastageReason } from "../generated/client";
import { Redirect } from 'react-router';
import strings from "src/localization/strings";

import {
  Grid,
  Button,
  Loader,
  Form,
  Message,
  Confirm
} from "semantic-ui-react";
import LocalizedValueInput from "./LocalizedValueInput";
import LocalizedUtils from "src/localization/localizedutils";
import { FormContainer } from "./FormContainer";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  wastageReasonId: string;
  wastageReason?: WastageReason;
  onWastageReasonSelected?: (wastageReason: WastageReason) => void;
  onWastageReasonDeleted?: (wastageReasonId: string) => void,
  onError: (error: ErrorMessage) => void
}

/**
 * Interface representing component state
 */
interface State {
  wastageReason?: WastageReason;
  redirect: boolean;
  saving: boolean;
  messageVisible: boolean;
  open: boolean;
}

/**
 * React component for edit wastageReason view
 */
class EditWastageReason extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      wastageReason: undefined,
      redirect: false,
      saving: false,
      messageVisible: false,
      open: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handeReasonChange = this.handeReasonChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  /**
   * Component did mount life-sycle method
   */
  public async componentDidMount() {
    try {
      if (!this.props.keycloak) {
        return;
      }
  
      const wastageReasonsService = await Api.getWastageReasonsService(this.props.keycloak);
  
      const wastageReason = await wastageReasonsService.findWastageReason({wastageReasonId: this.props.wastageReasonId});
      
      this.props.onWastageReasonSelected && this.props.onWastageReasonSelected(wastageReason);
      this.setState({wastageReason: wastageReason});
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Handle reason change
   * 
   * @param event event
   */
  private handeReasonChange(event: React.SyntheticEvent, { value }: any) {
    if (!this.state.wastageReason || this.state.wastageReason.id) {
      return;
    }

    const wastageReason = {
      id: this.state.wastageReason.id,
      reason: [{
        language: "fi",
        value: value
      }]
    };

    this.setState({wastageReason: wastageReason});
  }

  /**
   * Handle form submit
   */
  private async handleSubmit() {
    try {
      if (!this.props.keycloak || !this.state.wastageReason) {
        return;
      }
  
      const wastageReasonsService = await Api.getWastageReasonsService(this.props.keycloak);
  
      this.setState({saving: true});
      await wastageReasonsService.updateWastageReason({wastageReasonId: this.state.wastageReason.id!, wastageReason: this.state.wastageReason});
      this.setState({saving: false, messageVisible: true});
      setTimeout(() => {
        this.setState({messageVisible: false});
      }, 3000);
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Handle wastageReason delete
   */
  private async handleDelete() {
    try {
      if (!this.props.keycloak || !this.state.wastageReason) {
        return;
      }
  
      const wastageReasonsService = await Api.getWastageReasonsService(this.props.keycloak);
      const id = this.state.wastageReason.id || "";
      await wastageReasonsService.deleteWastageReason({wastageReasonId: id});
      
      this.props.onWastageReasonDeleted && this.props.onWastageReasonDeleted(id);
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
   * Updates reason text
   * 
   * @param reason localized entry representing reason
   */
  private updateReason = (reason: LocalizedValue[]) => {
    this.setState({
      wastageReason: {...this.state.wastageReason, reason: reason}
    });
  }

  /**
   * Render edit wastageReason view
   */
  public render() {
    if (!this.props.wastageReason) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Redirect to="/wastageReasons" push={true} />;
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={6}>
            <h2>{LocalizedUtils.getLocalizedValue(this.state.wastageReason ? this.state.wastageReason.reason : undefined)}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={()=>this.setState({open:true})}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{strings.wastageReasonReason}</label>
                <LocalizedValueInput 
                  onValueChange={this.updateReason}
                  value={this.state.wastageReason ? this.state.wastageReason.reason : undefined}
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
        <Confirm open={this.state.open} size={"mini"} content={strings.deleteConfirmationText + this.props.wastageReason!.reason![0].value} onCancel={()=>this.setState({open:false})} onConfirm={this.handleDelete} />
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
    wastageReasons: state.wastageReasons,
    wastageReason: state.wastageReason
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onWastageReasonSelected: (wastageReason: WastageReason) => dispatch(actions.wastageReasonSelected(wastageReason)),
    onWastageReasonDeleted: (wastageReasonId: string) => dispatch(actions.wastageReasonDeleted(wastageReasonId)),
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditWastageReason);