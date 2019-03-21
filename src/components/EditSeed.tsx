import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";import Api from "../api";
import { Seed, LocalizedEntry } from "famifarm-typescript-models";
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
  seedId: string;
  seed?: Seed;
  onSeedSelected?: (seed: Seed) => void;
  onSeedDeleted?: (seedId: string) => void;
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
    if (!this.props.keycloak) {
      return;
    }

    const seedsService = await Api.getSeedsService(this.props.keycloak);

    seedsService.findSeed(this.props.seedId).then((seed) => {
      this.props.onSeedSelected && this.props.onSeedSelected(seed);
      this.setState({seed: seed});
    });
  }


  /**
   * Updates seed name
   * 
   * @param name localized entry representing name
   */
  updateName = (name: LocalizedEntry) => {
    this.setState({
      seed: {...this.state.seed, name: name}
    });
  }

  /**
   * Handle form submit
   */
  private async handleSubmit() {
    if (!this.props.keycloak || !this.state.seed) {
      return;
    }

    const seedsService = await Api.getSeedsService(this.props.keycloak);

    this.setState({saving: true});
    seedsService.updateSeed(this.state.seed, this.state.seed.id || "");
    this.setState({saving: false});

    this.setState({messageVisible: true});
    setTimeout(() => {
      this.setState({messageVisible: false});
    }, 3000);
  }

  /**
   * Handle seed delete
   */
  private async handleDelete() {
    if (!this.props.keycloak || !this.state.seed) {
      return;
    }

    const seedsService = await Api.getSeedsService(this.props.keycloak);
    const id = this.state.seed.id || "";

    seedsService.deleteSeed(id).then(() => {
      this.props.onSeedDeleted && this.props.onSeedDeleted(id);
      this.setState({redirect: true});
    });
  }

  /**
   * Render edit seed view
   */
  public render() {
    if (!this.props.seed) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader active size="medium" />
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
            <h2>{this.props.seed!.name![0].value}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={()=>this.setState({open:true})}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
          <Form>
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
          </Form>
          </Grid.Column>
        </Grid.Row>
        <Confirm open={this.state.open} size={"mini"} content={strings.deleteConfirmationText+this.props.seed!.name![0].value} onCancel={()=>this.setState({open:false})} onConfirm={this.handleDelete} />
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
    onSeedDeleted: (seedId: string) => dispatch(actions.seedDeleted(seedId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditSeed);