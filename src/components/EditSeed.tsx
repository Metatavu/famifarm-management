import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { Seed } from "famifarm-typescript-models";
import { Redirect } from 'react-router';
import strings from "src/localization/strings";

import {
  Grid,
  Button,
  Loader,
  Form,
  Input,
  Message
} from "semantic-ui-react";

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
      messageVisible: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handeNameChange = this.handeNameChange.bind(this);
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
   * Handle name change
   * 
   * @param event event
   */
  private handeNameChange(event: React.FormEvent<HTMLInputElement>) {
    const seed = {
      id: this.state.seed!.id,
      name: [{
        language: "fi",
        value: event.currentTarget.value
      }]
    };

    this.setState({seed: seed});
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
            <Button className="danger-button" onClick={this.handleDelete}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
          <Form>
          <Form.Field required>
            <label>{strings.seedName}</label>
            <Input 
              value={this.state.seed && this.state.seed!.name![0].value} 
              placeholder={strings.seedName}
              onChange={this.handeNameChange}
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
      </Grid>
    );
  }
}

export default EditSeed;