import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { Pest, LocalizedEntry } from "famifarm-typescript-models";
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

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  pestId: string;
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
    if (!this.props.keycloak) {
      return;
    }

    const pestsService = await Api.getPestsService(this.props.keycloak);

    pestsService.findPest(this.props.pestId).then((pest) => {
      this.setState({pest: pest});
    });
  }


  /**
   * Updates pest name
   * 
   * @param name localized entry representing name
   */
  updateName = (name: LocalizedEntry) => {
    this.setState({
      pest: {...this.state.pest, name: name}
    });
  }

  /**
   * Handle form submit
   */
  private async handleSubmit() {
    if (!this.props.keycloak || !this.state.pest) {
      return;
    }

    const pestsService = await Api.getPestsService(this.props.keycloak);

    this.setState({saving: true});
    pestsService.updatePest(this.state.pest, this.state.pest.id || "");
    this.setState({saving: false});

    this.setState({messageVisible: true});
    setTimeout(() => {
      this.setState({messageVisible: false});
    }, 3000);
  }

  /**
   * Handle pest delete
   */
  private async handleDelete() {
    if (!this.props.keycloak || !this.state.pest) {
      return;
    }

    const pestsService = await Api.getPestsService(this.props.keycloak);
    const id = this.state.pest.id || "";

    pestsService.deletePest(id).then(() => {
      this.setState({redirect: true});
    });
  }

  /**
   * Render edit pest view
   */
  public render() {
    if (!this.state.pest) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Redirect to="/pests" push={true} />;
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
          <Form>
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
          </Form>
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

export default EditPest;