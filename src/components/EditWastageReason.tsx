import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { WastageReason } from "famifarm-typescript-models";
import { Redirect } from 'react-router';
import strings from "src/localization/strings";

import {
  Grid,
  Button,
  Loader,
  Form,
  Input,
  Message,
  Confirm
} from "semantic-ui-react";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  wastageReasonId: string;
  wastageReason?: WastageReason;
  onWastageReasonSelected?: (wastageReason: WastageReason) => void;
  onWastageReasonDeleted?: (wastageReasonId: string) => void;
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
    if (!this.props.keycloak) {
      return;
    }

    const wastageReasonsService = await Api.getWastageReasonsService(this.props.keycloak);

    wastageReasonsService.findWastageReason(this.props.wastageReasonId).then((wastageReason) => {
      this.props.onWastageReasonSelected && this.props.onWastageReasonSelected(wastageReason);
      this.setState({wastageReason: wastageReason});
    });
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
    if (!this.props.keycloak || !this.state.wastageReason) {
      return;
    }

    const wastageReasonsService = await Api.getWastageReasonsService(this.props.keycloak);

    this.setState({saving: true});
    wastageReasonsService.updateWastageReason(this.state.wastageReason, this.state.wastageReason.id || "");
    this.setState({saving: false});

    this.setState({messageVisible: true});
    setTimeout(() => {
      this.setState({messageVisible: false});
    }, 3000);
  }

  /**
   * Handle wastageReason delete
   */
  private async handleDelete() {
    if (!this.props.keycloak || !this.state.wastageReason) {
      return;
    }

    const wastageReasonsService = await Api.getWastageReasonsService(this.props.keycloak);
    const id = this.state.wastageReason.id || "";

    wastageReasonsService.deleteWastageReason(id).then(() => {
      this.props.onWastageReasonDeleted && this.props.onWastageReasonDeleted(id);
      this.setState({redirect: true});
    });
  }

  /**
   * Render edit wastageReason view
   */
  public render() {
    if (!this.props.wastageReason) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader active size="medium" />
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
            <h2>{this.props.wastageReason.reason![0].value}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={()=>this.setState({open:true})}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
          <Form>
          <Form.Field required>
            <label>{strings.wastageReasonReason}</label>
            <Input 
              value={this.state.wastageReason && this.state.wastageReason.reason![0].value} 
              placeholder={strings.wastageReasonReason}
              onChange={this.handeReasonChange}
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
        <Confirm open={this.state.open} size={"mini"} content={strings.deleteConfirmationText + this.props.wastageReason!.reason![0].value} onCancel={()=>this.setState({open:false})} onConfirm={this.handleDelete} />
      </Grid>
    );
  }
}

export default EditWastageReason;