import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";import Api from "../api";
import { SeedBatch, Seed } from "../generated/client";
import { redirect } from 'react-router-dom';
import { DateInput } from 'semantic-ui-calendar-react';
import strings from "../localization/strings";import {
  Grid,
  Button,
  Loader,
  Form,
  Input,
  Message,
  DropdownProps,
  Confirm,
  Checkbox
} from "semantic-ui-react";
import { FormContainer } from "./FormContainer";
import moment from "moment";

const DATE_FORMAT = "DD.MM.YYYY";

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
  onSeedsFound?: (seeds: Seed[]) => void,
   onError: (error: ErrorMessage | undefined) => void
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
    try {
      if (!this.props.keycloak) {
        return;
      }      
      const seedBatchesService = await Api.getSeedBatchesService(this.props.keycloak);
      const seedsService = await Api.getSeedsService(this.props.keycloak);      
      const seedBatch = await seedBatchesService.findSeedBatch({seedBatchId: this.props.seedBatchId});
      this.props.onSeedBatchSelected && this.props.onSeedBatchSelected(seedBatch);
      this.setState({seedBatch: seedBatch});      
      const seeds = await seedsService.listSeeds({});      
      this.props.onSeedsFound && this.props.onSeedsFound(seeds);
      this.setState({seeds: seeds});
    } catch (e: any) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
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
      time: this.state.seedBatch.time,
      active: this.state.seedBatch.active
    };    
    this.setState({seedBatch: seedBatch});
  }  
  /**
   * Handle select change
   * 
   * @param e event
   * @param {value} value
   */
  private onSelectChange = (e: any, { value }: DropdownProps) => {
    if (!this.state.seedBatch) {
      return;
    }    
    const seedBatch = {
      id: this.state.seedBatch.id,
      code: this.state.seedBatch.code,
      seedId: value as string,
      time: this.state.seedBatch.time,
      active: this.state.seedBatch.active
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
      time: moment(value as any, DATE_FORMAT).toDate(),
      active: this.state.seedBatch.active
    };    
    this.setState({seedBatch: seedBatch});
  }  
  /**
   * Handle time change
   * 
   * @param event event
   * @param {name, value} name and value
   */
  private handleActiveChange = () => {
    if (!this.state.seedBatch) {
      return;
    } 
    const active = !this.state.seedBatch.active;   
    const seedBatch = {
      id: this.state.seedBatch.id,
      code: this.state.seedBatch.code,
      seedId: this.state.seedBatch.seedId,
      time: this.state.seedBatch.time,
      active: active
    };    
    this.setState({seedBatch: seedBatch});
  }  
  /**
   * Handle form submit
   */
  private async handleSubmit() {
    try {
      if (!this.props.keycloak || !this.state.seedBatch) {
        return;
      }      
      const seedBatchesService = await Api.getSeedBatchesService(this.props.keycloak);      
      this.setState({saving: true});
      await seedBatchesService.updateSeedBatch({seedBatchId: this.state.seedBatch.id!, seedBatch: this.state.seedBatch});
      this.props.onSeedBatchSelected && this.props.onSeedBatchSelected(this.state.seedBatch);
      this.setState({saving: false});      
      this.setState({messageVisible: true});
      setTimeout(() => {
        this.setState({messageVisible: false});
      }, 3000);
    } catch (e: any) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }  
  /**
   * Handle seedBatch delete
   */
  private async handleDelete() {
    try {
      if (!this.props.keycloak || !this.state.seedBatch) {
        return;
      }      
      const seedBatchesService = await Api.getSeedBatchesService(this.props.keycloak);
      const id = this.state.seedBatch.id || "";
      await seedBatchesService.deleteSeedBatch({seedBatchId: id});      
      this.props.onSeedBatchDeleted && this.props.onSeedBatchDeleted(id!);
      this.setState({redirect: true});
    } catch (e: any) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }  
  /**
   * Render edit seedBatch view
   */
  public render() {
    if (!this.props.seedBatch) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }    
    if (this.state.redirect) {
      redirect("/seedBatches");
      return null;
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
          <FormContainer>
            <Form.Field required>
              <label>{strings.seedBatchCode}</label>
              <Input 
                value={this.state.seedBatch ? this.state.seedBatch.code : ""} 
                placeholder={strings.seedBatchCode}
                onChange={this.handeCodeChange}
              />
            </Form.Field>
            <Form.Select 
              fluid
              required 
              label={strings.seed} 
              options={seedOptions} 
              placeholder={strings.seed}
              onChange={this.onSelectChange}
              defaultValue={this.props.seedBatch ? this.props.seedBatch.seedId : ""}
            />
            <Form.Field required>
              <label>{strings.seedBatchArrived}</label>
              <DateInput
                name="dateTime"
                placeholder={strings.date}
                value={this.state.seedBatch ? moment(this.state.seedBatch.time).format(DATE_FORMAT) : ""}
                iconPosition="left"
                dateFormat={DATE_FORMAT}
                onChange={this.handleTimeChange}
              />
            </Form.Field>
            <Form.Field>
              <Checkbox label={strings.seedBatchState} onChange={this.handleActiveChange}  checked={this.state.seedBatch ? this.state.seedBatch.active : false} />
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
        <Confirm open={this.state.open} size={"mini"} content={strings.deleteConfirmationText +this.props.seedBatch!.code } onCancel={()=>this.setState({open:false})} onConfirm={this.handleDelete} />
      </Grid>
    );
  }
}/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    seedBatches: state.seedBatches,
    seedBatch: state.seedBatch,
    seeds: state.seeds
  };
}/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onSeedBatchSelected: (seedBatch: SeedBatch) => dispatch(actions.seedBatchSelected(seedBatch)),
    onSeedBatchDeleted: (seedBatchId: string) => dispatch(actions.seedBatchDeleted(seedBatchId)),
    onSeedsFound: (seeds: Seed[]) => dispatch(actions.seedsFound(seeds)),
     onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}export default connect(mapStateToProps, mapDispatchToProps)(EditSeedBatch);