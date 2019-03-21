import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";import Api from "../api";
import { PerformedCultivationAction, LocalizedEntry } from "famifarm-typescript-models";
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

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  performedCultivationActionId: string;
  performedCultivationAction?: PerformedCultivationAction;
  onPerformedCultivationActionSelected?: (performedCultivationAction: PerformedCultivationAction) => void;
  onPerformedCultivationActionDeleted?: (performedCultivationActionId: string) => void;
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
    if (!this.props.keycloak) {
      return;
    }
    
    const performedCultivationActionService = await Api.getPerformedCultivationActionsService(this.props.keycloak);
    performedCultivationActionService.findPerformedCultivationAction(this.props.performedCultivationActionId).then((performedCultivationAction) => {
      this.props.onPerformedCultivationActionSelected && this.props.onPerformedCultivationActionSelected(performedCultivationAction);
      this.setState({performedCultivationAction: performedCultivationAction});
    });
  }

  /**
   *  Updates performed cultivation action name
   * 
   * @param name localized entry representing name
   */
  updateName = (name: LocalizedEntry) => {
    this.setState({
      performedCultivationAction: {...this.state.performedCultivationAction, name: name}
    });
  }

  /**
   * Handle form submit
   */
  private async handleSubmit() {
    if (!this.props.keycloak || !this.state.performedCultivationAction) {
      return;
    }

    this.setState({saving: true});

    const performedCultivationActionService = await Api.getPerformedCultivationActionsService(this.props.keycloak);
    performedCultivationActionService.updatePerformedCultivationAction(this.state.performedCultivationAction, this.state.performedCultivationAction.id!);
    
    this.setState({saving: false});

    this.setState({messageVisible: true});
    setTimeout(() => {
      this.setState({messageVisible: false});
    }, 3000);
  }

  /**
   * Handle performedCultivationAction delete
   */
  private async handleDelete() {
    if (!this.props.keycloak) {
      return;
    }

    const id = this.state.performedCultivationAction!.id;
    const performedCultivationActionService = await Api.getPerformedCultivationActionsService(this.props.keycloak);
    performedCultivationActionService.deletePerformedCultivationAction(id!).then(() => {
      this.props.onPerformedCultivationActionDeleted && this.props.onPerformedCultivationActionDeleted(id!);
      this.setState({redirect: true});
    });
  }

  /**
   * Render edit performedCultivationAction view
   */
  public render() {
    if (!this.props.performedCultivationAction) {
      return (
        <Grid style={{paddingTop: "100px"}} centered >
          <Loader active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Redirect to="/performedCultivationActions" push={true} />;
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={6}>
            <h2>{this.props.performedCultivationAction!.name![0].value}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={()=>this.setState({open:true})}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
          <Form>
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
          </Form>
          </Grid.Column>
        </Grid.Row>
        <Confirm open={this.state.open} size={"mini"} content={strings.deleteConfirmationText + this.props.performedCultivationAction!.name![0].value} onCancel={()=>this.setState({open:false})} onConfirm={this.handleDelete} />
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
    performedCultivationAction: state.performedCultivationAction
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
    onPerformedCultivationActionDeleted: (performedCultivationActionId: string) => dispatch(actions.performedCultivationActionDeleted(performedCultivationActionId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditPerformedCultivationAction);