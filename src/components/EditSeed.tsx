import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";import Api from "../api";
import { LocalizedValue, Seed } from "../generated/client";
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
import { FormContainer } from "./FormContainer";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  seedId: string;
  seed?: Seed;
  onSeedSelected?: (seed: Seed) => void;
  onSeedDeleted?: (seedId: string) => void,
  onError: (error: ErrorMessage) => void
}

/**
 * Interface representing component state
 */
interface State {
  seed?: Seed;
  redirect: boolean;
  saving: boolean;
  messageVisible: boolean;
  open: boolean;
}

/**
 * React component for edit seed view
 */
class EditSeed extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      seed: undefined,
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
    try {
      if (!this.props.keycloak) {
        return;
      }
  
      const seedsService = await Api.getSeedsService(this.props.keycloak);
      const seed = await seedsService.findSeed({seedId: this.props.seedId});
      
      this.props.onSeedSelected && this.props.onSeedSelected(seed);
      this.setState({seed: seed});
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }


  /**
   * Updates seed name
   * 
   * @param name localized entry representing name
   */
  updateName = (name: LocalizedValue[]) => {
    this.setState({
      seed: {...this.state.seed, name: name}
    });
  }

  /**
   * Handle form submit
   */
  private async handleSubmit() {
    try {
      if (!this.props.keycloak || !this.state.seed) {
        return;
      }
  
      const seedsService = await Api.getSeedsService(this.props.keycloak);
  
      this.setState({saving: true});
      await seedsService.updateSeed({seedId: this.state.seed.id!, seed: this.state.seed});
      this.setState({saving: false});
  
      this.setState({messageVisible: true});
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
   * Handle seed delete
   */
  private async handleDelete() {
    try {
      if (!this.props.keycloak || !this.state.seed) {
        return;
      }
  
      const seedsService = await Api.getSeedsService(this.props.keycloak);
      const id = this.state.seed.id || "";
      await seedsService.deleteSeed({seedId: id});
  
      this.props.onSeedDeleted && this.props.onSeedDeleted(id);
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
   * Render edit seed view
   */
  public render() {
    if (!this.props.seed) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Redirect to="/seeds" push={true} />;
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={6}>
            <h2>{this.props.seed.name && this.props.seed.name[0] ? this.props.seed!.name![0].value : ""}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={()=>this.setState({open:true})}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
          <FormContainer>
            <Form.Field required>
              <label>{strings.seedName}</label>
              <LocalizedValueInput 
                onValueChange={this.updateName}
                value={this.state.seed ? this.state.seed.name : undefined}
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
        <Confirm open={this.state.open} size={"mini"} content={strings.deleteConfirmationText+(this.props.seed ? this.props.seed.name && this.props.seed.name[0] : "")} onCancel={()=>this.setState({open:false})} onConfirm={this.handleDelete} />
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
    seeds: state.seeds,
    seed: state.seed
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onSeedSelected: (seed: Seed) => dispatch(actions.seedSelected(seed)),
    onSeedDeleted: (seedId: string) => dispatch(actions.seedDeleted(seedId)),
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditSeed);