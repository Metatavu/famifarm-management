import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { SeedBatch, Seed } from "famifarm-typescript-models";
import { Redirect } from 'react-router';
import { DateInput } from 'semantic-ui-calendar-react';
import strings from "src/localization/strings";

import {
  Grid,
  Button,
  Loader,
  Form,
  Input,
  Message,
  InputOnChangeData,
  Confirm
} from "semantic-ui-react";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  seedBatchId: string;
  seedBatch?: SeedBatch;
  onSeedBatchSelected?: (seedBatch: SeedBatch) => void;
  onSeedBatchDeleted?: (seedBatchId: string) => void;
  seeds?: Seed[];
  onSeedsFound?: (seeds: Seed[]) => void;
}

/**
 * Interface representing component state
 */
interface State {
  code: string;
  seedId: string;
  time: string;
  seedBatch?: SeedBatch;
  redirect: boolean;
  saving: boolean;
  messageVisible: boolean;
  seeds: Seed[];
  open:boolean;
}

/**
 * React component for edit seed batch view
 */
class EditSeedBatch extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      code: "",
      seedId: "",
      time: "",
      seedBatch: undefined,
      redirect: false,
      saving: false,
      messageVisible: false,
      seeds: [],
      open:false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handeCodeChange = this.handeCodeChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  /**
   * Component did mount life-sycle method
   */
  public async componentDidMount() {
    if (!this.props.keycloak) {
      return;
    }

    const seedBatchesService = await Api.getSeedBatchesService(this.props.keycloak);
    const seedsService = await Api.getSeedsService(this.props.keycloak);

    seedBatchesService.findSeedBatch(this.props.seedBatchId).then((seedBatch) => {
      this.props.onSeedBatchSelected && this.props.onSeedBatchSelected(seedBatch);
      this.setState({seedBatch: seedBatch});
    });

    seedsService.listSeeds().then((seeds) => {
      this.props.onSeedsFound && this.props.onSeedsFound(seeds);
      this.setState({seeds: seeds});
    });
  }

  /**
   * Handle name change
   * 
   * @param event event
   */
  private handeCodeChange(event: React.FormEvent<HTMLInputElement>) {
    if (!this.state.seedBatch) {
      return;
    }
    const seedBatch = {
      id: this.state.seedBatch!.id,
      code: event.currentTarget.value,
      seedId: this.state.seedBatch.seedId,
      time: this.state.seedBatch.time
    };

    this.setState({seedBatch: seedBatch});
  }

  /**
   * Handle select change
   * 
   * @param e event
   * @param {value} value
   */
  private onSelectChange = (e: any, { value }: InputOnChangeData) => {
    if (!this.state.seedBatch) {
      return;
    }

    const seedBatch = {
      id: this.state.seedBatch.id,
      code: this.state.seedBatch.code,
      seedId: value,
      time: this.state.seedBatch.time
    };

    this.setState({seedBatch: seedBatch});
  }

  /**
   * Handle time change
   * 
   * @param event event
   * @param {name, value} name and value
   */
  private handleTimeChange = (event: any, {name, value} : any) => {
    if (!this.state.seedBatch) {
      return;
    }

    const seedBatch = {
      id: this.state.seedBatch.id,
      code: this.state.seedBatch.code,
      seedId: this.state.seedBatch.seedId,
      time: value
    };

    this.setState({seedBatch: seedBatch});
  }

  /**
   * Handle form submit
   */
  private async handleSubmit() {
    if (!this.props.keycloak || !this.state.seedBatch) {
      return;
    }

    const seedBatchesService = await Api.getSeedBatchesService(this.props.keycloak);

    this.setState({saving: true});
    seedBatchesService.updateSeedBatch(this.state.seedBatch, this.state.seedBatch.id || "");
    this.props.onSeedBatchSelected && this.props.onSeedBatchSelected(this.state.seedBatch);
    this.setState({saving: false});

    this.setState({messageVisible: true});
    setTimeout(() => {
      this.setState({messageVisible: false});
    }, 3000);
  }

  /**
   * Handle seedBatch delete
   */
  private async handleDelete() {
    if (!this.props.keycloak || !this.state.seedBatch) {
      return;
    }

    const seedBatchesService = await Api.getSeedBatchesService(this.props.keycloak);
    const id = this.state.seedBatch.id || "";

    seedBatchesService.deleteSeedBatch(id).then(() => {
      this.props.onSeedBatchDeleted && this.props.onSeedBatchDeleted(id!);
      this.setState({redirect: true});
    });
  }

  /**
   * Render edit seedBatch view
   */
  public render() {
    if (!this.props.seedBatch) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Redirect to="/seedBatches" push={true} />;
    }

    const seedOptions = (this.props.seeds || []).map((seed) => {
      return {
        key: seed.id,
        text: seed.name![0].value,
        value: seed.id
      };
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={6}>
            <h2>{this.props.seedBatch!.code}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={()=>this.setState({open:true})}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
          <Form>
          <Form.Field required>
          <label>{strings.seedBatchCode}</label>
          <Input 
            value={this.state.seedBatch ? this.state.seedBatch.code : ""} 
            placeholder={strings.seedBatchCode}
            onChange={this.handeCodeChange}
          />
          <Form.Select 
            fluid 
            label={strings.seed} 
            options={seedOptions} 
            placeholder={strings.seed}
            onChange={this.onSelectChange}
            defaultValue={this.props.seedBatch ? this.props.seedBatch.seedId : ""}
          />
          <label>{strings.seedBatchArrived}</label>
          <DateInput
            name="dateTime"
            placeholder={strings.date}
            value={this.state.seedBatch ? this.state.seedBatch.time : ""}
            iconPosition="left"
            dateFormat="YYYY-MM-DDTHH:mmZ"
            onChange={this.handleTimeChange}
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
        <Confirm open={this.state.open} size={"mini"} content={strings.deleteConfirmationText +this.props.seedBatch!.code } onCancel={()=>this.setState({open:false})} onConfirm={this.handleDelete} />
      </Grid>
    );
  }
}

export default EditSeedBatch;