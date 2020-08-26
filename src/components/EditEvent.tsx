import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { PackageSize, Event, CultivationObservationEventData, HarvestEventData, PlantingEventData, SowingEventData, TableSpreadEventData, WastageEventData, PerformedCultivationAction, Pest, ProductionLine, SeedBatch, WastageReason, Seed } from "famifarm-typescript-models";
import { Redirect } from 'react-router';
import strings from "src/localization/strings";
import { DateTimeInput } from 'semantic-ui-calendar-react';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  Grid,
  Button,
  Loader,
  Form,
  Message,
  InputOnChangeData,
  Confirm,
  TextAreaProps
} from "semantic-ui-react";
import LocalizedUtils from "src/localization/localizedutils";
import * as moment from "moment";
import { ErrorMessage } from "src/types";
import { FormContainer } from "./FormContainer";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  eventId: string,
  onError: (error: ErrorMessage) => void
}

/**
 * Interface representing component state
 */
interface State {
  open: boolean
  loading: boolean
  saving: boolean
  messageVisible: boolean,
  redirect: boolean
  event?: Event
  performedCultivationActions?: PerformedCultivationAction[]
  pests?: Pest[],
  productionLines?: ProductionLine[]
  packageSizes?: PackageSize[]
  seedBatches?: SeedBatch[]
  wastageReasons?: WastageReason[]
  seeds?: Seed[]
}

/**
 * React component for edit event view
 */
class EditEvent extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      redirect: false,
      saving: false,
      messageVisible: false,
      open: false
    };
  }

  /**
   * Component did mount life-sycle method
   */
  public async componentDidMount() {
    try {
      if (!this.props.keycloak) {
        return;
      }
  
      this.setState({loading: true});
      const eventsService = await Api.getEventsService(this.props.keycloak);
      const event = await eventsService.findEvent(this.props.eventId);
      const seedsService = await Api.getSeedsService(this.props.keycloak);
      const seeds = await seedsService.listSeeds(undefined, undefined);
      this.setState({
        event: event,
        loading: false,
        seeds: seeds
      });
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Render edit product view
   */
  public render() {
    if (this.state.loading) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Redirect to={this.state.event ? `/batches/${this.state.event.batchId}` : "/batches"} push={true} />;
    }

    if (!this.state.event) {
      return null;
    }
    const event: Event = this.state.event;

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={6}>
            <h2>{strings.editEventHeader}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={() => this.setState({open:true})}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{strings.labelStartTime}</label>
                <DateTimeInput dateTimeFormat="YYYY.MM.DD HH:mm" onChange={this.handleTimeChange} name="startTime" value={moment(event.startTime).format("YYYY.MM.DD HH:mm")} />
              </Form.Field>
              <Form.Field>
                <label>{strings.labelEndTime}</label>
                <DateTimeInput dateTimeFormat="YYYY.MM.DD HH:mm" onChange={this.handleTimeChange} name="endTime" value={moment(event.endTime).format("YYYY.MM.DD HH:mm")} />
              </Form.Field>
              {this.renderEventDataForm(event)}
              <Form.TextArea label={strings.labelAdditionalInformation} onChange={this.handleBaseChange} name="additionalInformation" value={event.additionalInformation} />
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
              <Button onClick={() => this.setState({redirect: true})}>
                {strings.goBack}
              </Button>
            </FormContainer>
          </Grid.Column>
        </Grid.Row>
        <Confirm open={this.state.open} size={"mini"} content={strings.deleteEventConfirmText} onCancel={()=>this.setState({open:false})} onConfirm={this.handleDelete} />
      </Grid>
    );
  }

    /**
   * Handle value change
   * 
   * @param event event
   */
  private handleTimeChange = (e: any, { name, value }: InputOnChangeData | TextAreaProps) => {
    const eventData = this.state.event;
    if (!eventData) {
      return;
    }

    eventData[name] = moment(value, "YYYY.MM.DD HH:mm").toISOString();
    this.setState({ event: eventData });
  }

  /**
   * Handle value change
   * 
   * @param event event
   */
  private handleBaseChange = (e: any, { name, value }: InputOnChangeData | TextAreaProps) => {
    const eventData = this.state.event;
    if (!eventData) {
      return;
    }

    eventData[name] = value;
    this.setState({ event: eventData });
  }

  /**
   * Handle value change
   * 
   * @param event event
   */
  private handleDataChange = (e: any, { name, value }: InputOnChangeData | TextAreaProps) => {
    const eventData = this.state.event;
    if (!eventData) {
      return;
    }

    eventData.data[name] = value;
    this.setState({ event: eventData });
  }

  private sortProductionLines = (productionLines: ProductionLine[]) => {
    return productionLines.sort((a, b) => {
      let nameA = this.getStringsNumber(a.lineNumber)
      let nameB = this.getStringsNumber(b.lineNumber)
      if(nameA < nameB) { return -1; }
      if(nameA > nameB) { return 1; }
      return 0;
    });
  }

  /**
   * Get containing numbers in string
   * 
   * @param string string
   * @returns Number
   */
  private getStringsNumber = (string ?: string) : Number => {
    return string && string.match(/\d+/g) ? Number(string.match(/\d+/g)) : 0;
  }

  /**
   * Handle form submit
   */
  private handleSubmit = async () => {
    const { event } = this.state;
    try {
      if (!this.props.keycloak || !event) {
        return;
      }

      this.setState({saving: true});
      const eventsService = await Api.getEventsService(this.props.keycloak);

      const eventData = event.data as any;
      let data = {};
      switch (event.type) {
        case "CULTIVATION_OBSERVATION":
          data = {
            luminance: eventData.luminance,
            performedActionIds: eventData.performedActionIds,
            pestIds: eventData.pestIds,
            weight: eventData.weight
          } as CultivationObservationEventData;
        break;
        case "HARVEST":
          data = {
            gutterCount: eventData.gutterCount,
            productionLineId: eventData.productionLineId,
            type: eventData.type
          } as HarvestEventData;
        break;
        case "PLANTING":
          data = {
            gutterCount: eventData.gutterCount,
            gutterHoleCount: eventData.gutterHoleCount,
            productionLineId: eventData.productionLineId, 
            trayCount: eventData.trayCount,
            workerCount: eventData.workerCount
          } as PlantingEventData;
        break;
        case "SOWING":
          data = {
            amount: eventData.amount,
            potType: eventData.potType,
            productionLineId: eventData.productionLineId,
            seedBatchIds: eventData.seedBatchIds
          } as SowingEventData;
        break;
        case "TABLE_SPREAD":
          data = {
            trayCount: eventData.trayCount
          } as TableSpreadEventData;
        break;
        case "WASTAGE":
          data = {
            amount: eventData.amount,
            phase: eventData.phase,
            productionLineId: eventData.productionLineId,
            reasonId: eventData.reasonId
          } as WastageEventData;
        break;
      }
      event.data = data;

      await eventsService.updateEvent(event, event.id!);
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
   * Handle product delete
   */
  private handleDelete = async () => {
    try {
      if (!this.props.keycloak || !this.state.event) {
        return;
      }
  
      const eventsService = await Api.getEventsService(this.props.keycloak);
      const id = this.state.event.id || "";
  
      await eventsService.deleteEvent(id);
      
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
   * Renders form suitable for specific event type
   */
  private renderEventDataForm = (event: Event) => {
    switch (event.type) {
      case "CULTIVATION_OBSERVATION":
        return this.renderCultivationObservationDataForm(event.data as CultivationObservationEventData);
      case "HARVEST":
        return this.renderHarvesDataForm(event.data as HarvestEventData);
      case "PLANTING":
        return this.renderPlantingDataForm(event.data as PlantingEventData);
      case "SOWING":
        return this.renderSowingDataForm(event.data as SowingEventData);
      case "TABLE_SPREAD":
        return this.renderTableSpreadDataForm(event.data as TableSpreadEventData);
      case "WASTAGE":
        return this.renderWastageDataForm(event.data as WastageEventData);
    }
  }

  /**
   * Renders cultivation observations event form
   */
  private renderCultivationObservationDataForm = (data: CultivationObservationEventData) => {
    if (!this.state.performedCultivationActions || !this.state.pests) {
      this.loadCultivationObservationData().catch((e) => {
        this.props.onError({
          message: strings.defaultApiErrorMessage,
          title: strings.defaultApiErrorTitle,
          exception: e
        });
      });

      return;
    }

    const performedActionsOptions = this.state.performedCultivationActions.map((performedCultivationAction) => {
      return {
        key: performedCultivationAction.id,
        value: performedCultivationAction.id,
        text: LocalizedUtils.getLocalizedValue(performedCultivationAction.name)
      };
    });

    const pestOptions = this.state.pests.map((pest) => {
      return {
        key: pest.id,
        value: pest.id,
        text: LocalizedUtils.getLocalizedValue(pest.name)
      };
    });

    return (
      <React.Fragment>
        <Form.Input label={strings.labelLuminance} name="luminance" onChange={this.handleDataChange} value={data.luminance} />
        <Form.Input label={strings.labelWeight} name="weight" onChange={this.handleDataChange} value={data.weight} />
        <Form.Select label={strings.labelPerformedCultivationActions} name="performedActionIds" options={performedActionsOptions} multiple value={data.performedActionIds} onChange={this.handleDataChange} />
        <Form.Select label={strings.labelPests} name="pestIds" options={pestOptions} multiple value={data.pestIds} onChange={this.handleDataChange} />
      </React.Fragment>
    );
  }

  /**
   * Renders harvest event form
   */
  private renderHarvesDataForm = (data: HarvestEventData) => {
    if (!this.state.productionLines) {
      this.loadHarvestData().catch((e) => {
        this.props.onError({
          message: strings.defaultApiErrorMessage,
          title: strings.defaultApiErrorTitle,
          exception: e
        });
      });

      return;
    }

    const productionLineOptions = this.state.productionLines.map((productionLine) => {
      return {
        key: productionLine.id,
        value: productionLine.id,
        text: productionLine.lineNumber
      };
    });

    const harvestTypeOptions = ['BAGGING', 'CUTTING', 'BOXING'].map((harvestType) => {
      return {
        key: harvestType,
        value: harvestType,
        text: strings.getString(`harvestType${harvestType}`, strings.getLanguage())
      };
    });

    return (
      <React.Fragment>
        <Form.Select required label={strings.labelHarvestType} name="type" options={harvestTypeOptions} value={data.type} onChange={this.handleDataChange} />
        <Form.Input required label={strings.labelGutterCount} name="gutterCount" type="number" value={data.gutterCount} onChange={this.handleDataChange} />
        <Form.Select required label={strings.labelProductionLine} name="productionLineId" options={productionLineOptions} value={data.productionLineId} onChange={this.handleDataChange} />
      </React.Fragment>
    )
  }

  /**
   * Renders planting event form
   */
  private renderPlantingDataForm = (data: PlantingEventData) => {
    if (!this.state.productionLines) {
      this.loadPlantingData().catch((e) => {
        this.props.onError({
          message: strings.defaultApiErrorMessage,
          title: strings.defaultApiErrorTitle,
          exception: e
        });
      });

      return;
    }

    const productionLineOptions = this.state.productionLines.map((productionLine) => {
      return {
        key: productionLine.id,
        value: productionLine.id,
        text: productionLine.lineNumber
      };
    });

    return (
      <React.Fragment>
        <Form.Select required label={strings.labelProductionLine} name="productionLineId" options={productionLineOptions} value={data.productionLineId} onChange={this.handleDataChange} />
        <Form.Input required label={strings.labelTrayCount} name="trayCount" type="number" value={data.trayCount} onChange={this.handleDataChange} />
        <Form.Input required label={strings.labelGutterCount} name="gutterCount" type="number" value={data.gutterCount} onChange={this.handleDataChange} />
        <Form.Input required label={strings.labelGutterHoleCount} name="gutterHoleCount" type="number" value={data.gutterHoleCount} onChange={this.handleDataChange} />
        <Form.Input required label={strings.labelWorkerCount} name="workerCount" type="number" value={data.workerCount} onChange={this.handleDataChange} />
      </React.Fragment>
    );
  }

  /**
   * Renders sowing event form
   */
  private renderSowingDataForm = (data: SowingEventData) => {
    if (!this.state.productionLines || !this.state.seedBatches) {
      this.loadSowingData().catch((e) => {
        this.props.onError({
          message: strings.defaultApiErrorMessage,
          title: strings.defaultApiErrorTitle,
          exception: e
        });
      });

      return;
    }

    const productionLineOptions = this.state.productionLines.map((productionLine) => {
      return {
        key: productionLine.id,
        value: productionLine.id,
        text: productionLine.lineNumber
      };
    });

    const getSeedName = (seedId?:String): any => {
      if (this.state.seeds === null || this.state.seeds === undefined) {
        return
      }
      const seed = this.state.seeds.find(seed => seed.id === seedId)
      if (seed === null || seed === undefined) {
        return
      }
      return LocalizedUtils.getLocalizedValue(seed.name)
    }

    const seedBatchOptions = this.state.seedBatches.map((seedBatch) => {
      return {
        key: seedBatch.id,
        value: seedBatch.id,
        text: seedBatch.code + " " + getSeedName(seedBatch.seedId)
      };
    });

    const potTypeOptions = ['SMALL', 'LARGE'].map((potType) => {
      return {
        key: potType,
        value: potType,
        text: strings.getString(`potType${potType}`, strings.getLanguage())
      };
    });

    return (
      <React.Fragment>
        <Form.Input required label={strings.labelTrayCount} name="amount" type="number" value={data.amount} onChange={this.handleDataChange} />
        <Form.Select required label={strings.labelProductionLine} name="productionLineId" options={productionLineOptions} value={data.productionLineId} onChange={this.handleDataChange} />
        <Form.Select required label={strings.labelSeedBatch} name="seedBatchIds" options={seedBatchOptions} multiple value={data.seedBatchIds} onChange={this.handleDataChange} />
        <Form.Select required label={strings.labelPotType} name="potType" options={potTypeOptions} value={data.potType} onChange={this.handleDataChange} />
      </React.Fragment>
    );
  }


  /**
   * Renders table spread event form
   */
  private renderTableSpreadDataForm = (data: TableSpreadEventData) => {
    return (
      <React.Fragment>
        <Form.Input required label={strings.labelTrayCount} name="trayCount" value={data.trayCount} onChange={this.handleDataChange} />
      </React.Fragment>
    );
  }


  /**
   * Renders wastage event form
   */
  private renderWastageDataForm = (data: WastageEventData) => {
    if (!this.state.productionLines || !this.state.wastageReasons) {
      this.loadWastageData().catch((e) => {
        this.props.onError({
          message: strings.defaultApiErrorMessage,
          title: strings.defaultApiErrorTitle,
          exception: e
        });
      });

      return;
    }

    const wastageReasonOptions = this.state.wastageReasons.map((wastageReason) => {
      return {
        key: wastageReason.id,
        value: wastageReason.id,
        text: LocalizedUtils.getLocalizedValue(wastageReason.reason)
      };
    });

    const productionLineOptions = this.state.productionLines.map((productionLine) => {
      return {
        key: productionLine.id,
        value: productionLine.id,
        text: productionLine.lineNumber
      };
    });

    const phaseOptions = ['PLANTING', 'SOWING', 'TABLE_SPREAD', 'CULTIVATION_OBSERVATION', 'HARVEST' ].map((phase) => {
      return {
        key: phase,
        value: phase,
        text: strings.getString(`phase${phase}`, strings.getLanguage())
      };
    })

    return (
      <React.Fragment>
        <Form.Select required label={strings.labelWastageReason} name="reasonId" options={wastageReasonOptions} value={data.reasonId} onChange={this.handleDataChange} />
        <Form.Select label={strings.labelProductionLine} name="productionLineId" options={productionLineOptions} value={data.productionLineId} onChange={this.handleDataChange} />
        <Form.Select label={strings.labelPhase} name="phase" options={phaseOptions} value={data.phase} onChange={this.handleDataChange} />
        <Form.Input required label={strings.labelAmount} name="amount" type="number" value={data.amount} onChange={this.handleDataChange} />
      </React.Fragment>
    );
  }

  /**
   * Loads data required for harvest event
   */
  private loadHarvestData = async () => {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({loading: true});
    const productionLinesService = await Api.getProductionLinesService(this.props.keycloak);

    const productionLines = await productionLinesService.listProductionLines();

    this.setState({
      loading: false,
      productionLines: this.sortProductionLines(productionLines)
    });
  }

  /**
   * Loads data required for observations event
   */
  private loadCultivationObservationData = async () => {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({loading: true});
    const [performedCultivationActionsService, pestsService] = await Promise.all([
      Api.getPerformedCultivationActionsService(this.props.keycloak),
      Api.getPestsService(this.props.keycloak)
    ]);

    const [performedCultivationActions, pests] = await Promise.all([
      performedCultivationActionsService.listPerformedCultivationActions(),
      pestsService.listPests()
    ]);

    this.setState({
      loading: false,
      pests: pests,
      performedCultivationActions: performedCultivationActions
    });
  }

  /**
   * Loads data required for planting event
   */
  private loadPlantingData = async () => {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({loading: true});
    const getProductionLinesService = await Api.getProductionLinesService(this.props.keycloak);
    const productionLines = await getProductionLinesService.listProductionLines();

    this.setState({
      loading: false,
      productionLines: this.sortProductionLines(productionLines)
    });
  }

  /**
   * Loads data required for sowing event
   */
  private loadSowingData = async () => {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({loading: true});
    const [seedBatchesService, productionLinesService] = await Promise.all([
      Api.getSeedBatchesService(this.props.keycloak),
      Api.getProductionLinesService(this.props.keycloak)
    ]);

    const [seedBatches, productionLines] = await Promise.all([
      seedBatchesService.listSeedBatches(),
      productionLinesService.listProductionLines()
    ]);

    this.setState({
      loading: false,
      seedBatches: seedBatches,
      productionLines: this.sortProductionLines(productionLines)
    });
  }

  /**
   * Loads data required for wastage event
   */
  private loadWastageData = async () => {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({loading: true});
    const [wastageReasonsService, productionLinesService] = await Promise.all([
      Api.getWastageReasonsService(this.props.keycloak),
      Api.getProductionLinesService(this.props.keycloak)
    ]);

    const [wastageReasons, productionLines] = await Promise.all([
      wastageReasonsService.listWastageReasons(),
      productionLinesService.listProductionLines()
    ]);

    this.setState({
      loading: false,
      wastageReasons: wastageReasons,
      productionLines: this.sortProductionLines(productionLines)
    });
  }
}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditEvent);