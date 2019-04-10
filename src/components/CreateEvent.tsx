import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { PackageSize, Event, CultivationObservationEventData, HarvestEventData, PackingEventData, PlantingEventData, SowingEventData, TableSpreadEventData, WastageEventData, PerformedCultivationAction, Pest, ProductionLine, SeedBatch, WastageReason, Team } from "famifarm-typescript-models";
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

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  batchId: string,
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
  teams?: Team[],
  productionLines?: ProductionLine[]
  packageSizes?: PackageSize[]
  seedBatches?: SeedBatch[]
  wastageReasons?: WastageReason[]
}

/**
 * React component for edit event view
 */
class CreateEvent extends React.Component<Props, State> {

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
  public componentDidMount = () => {
    this.setState({
      event: {
        batchId: this.props.batchId,
        startTime: moment().toISOString(),
        endTime: moment().toISOString(),
        data: {},
        type: "SOWING"
      }
    });
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
    const eventTypeOptions = [
      "SOWING",
      "TABLE_SPREAD",
      "PLANTING",
      "CULTIVATION_OBSERVATION",
      "HARVEST",
      "PACKING"].map((eventType) => {
      return {
        key: eventType,
        value: eventType,
        text: strings[`phase${eventType}`]
      };
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={6}>
            <h2>{strings.addEventHeader}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <Form>
              <Form.Field>
                <label>{strings.labelStartTime}</label>
                <DateTimeInput dateTimeFormat="YYYY.MM.DD HH:mm" onChange={this.handleTimeChange} name="startTime" value={moment(event.startTime).format("YYYY.MM.DD HH:mm")} />
              </Form.Field>
              <Form.Field>
                <label>{strings.labelEndTime}</label>
                <DateTimeInput dateTimeFormat="YYYY.MM.DD HH:mm" onChange={this.handleTimeChange} name="endTime" value={moment(event.endTime).format("YYYY.MM.DD HH:mm")} />
              </Form.Field>
              <Form.Field>
                <label>{strings.labelEventType}</label>
                <Form.Select name="type" options={eventTypeOptions} value={event.type} onChange={this.handleBaseChange} />
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
            </Form>
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

  /**
   * Handle form submit
   */
  private handleSubmit = async () => {
    try {
      if (!this.props.keycloak || !this.state.event) {
        return;
      }
  
      this.setState({saving: true});
      const eventsService = await Api.getEventsService(this.props.keycloak);
      await eventsService.createEvent(this.state.event);
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
      case "PACKING":
        return this.renderPackingDataForm(event.data as PackingEventData);
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
    if (!this.state.teams || !this.state.productionLines) {
      this.loadHarvestData().catch((e) => {
        this.props.onError({
          message: strings.defaultApiErrorMessage,
          title: strings.defaultApiErrorTitle,
          exception: e
        });
      });

      return;
    }

    const teamOptions = this.state.teams.map((team) => {
      return {
        key: team.id,
        value: team.id,
        text: LocalizedUtils.getLocalizedValue(team.name)
      };
    });

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
        <Form.Select label={strings.labelHarvestType} name="type" options={harvestTypeOptions} value={data.type} onChange={this.handleDataChange} />
        <Form.Input label={strings.labelGutterCount} name="gutterCount" type="number" value={data.gutterCount} onChange={this.handleDataChange} />
        <Form.Select label={strings.labelProductionLine} name="productionLineId" options={productionLineOptions} value={data.productionLineId} onChange={this.handleDataChange} />
        <Form.Select label={strings.labelTeam} name="teamId" options={teamOptions} value={data.teamId} onChange={this.handleDataChange} />
      </React.Fragment>
    )
  }

  /**
   * Renders packing event form
   */
  private renderPackingDataForm = (data: PackingEventData) => {
    if (!this.state.packageSizes) {
      this.loadPackingData().catch((e) => {
        this.props.onError({
          message: strings.defaultApiErrorMessage,
          title: strings.defaultApiErrorTitle,
          exception: e
        });
      });

      return;
    }

    const packageSizeOptions = this.state.packageSizes.map((packageSize) => {
      return {
        key: packageSize.id,
        value: packageSize.id,
        text: LocalizedUtils.getLocalizedValue(packageSize.name)
      }
    });

    return (
      <React.Fragment>
        <Form.Input label={strings.labelPackedCount} name="packedCount" type="number" value={data.packedCount} onChange={this.handleDataChange} />
        <Form.Select label={strings.labelPackageSize} name="packageSizeId" options={packageSizeOptions} value={data.packageSizeId} onChange={this.handleDataChange} />
      </React.Fragment>
    );
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
        <Form.Select label={strings.labelProductionLine} name="productionLineId" options={productionLineOptions} value={data.productionLineId} onChange={this.handleDataChange} />
        <Form.Input label={strings.labelTrayCount} name="trayCount" type="number" value={data.trayCount} onChange={this.handleDataChange} />
        <Form.Input label={strings.labelGutterCount} name="gutterCount" type="number" value={data.gutterCount} onChange={this.handleDataChange} />
        <Form.Input label={strings.labelGutterHoleCount} name="gutterHoleCount" type="number" value={data.gutterHoleCount} onChange={this.handleDataChange} />
        <Form.Input label={strings.labelWorkerCount} name="workerCount" type="number" value={data.workerCount} onChange={this.handleDataChange} />
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

    const seedBatchOptions = this.state.seedBatches.map((seedBatch) => {
      return {
        key: seedBatch.id,
        value: seedBatch.id,
        text: seedBatch.code
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
        <Form.Input label={strings.labelAmount} name="amount" type="number" value={data.amount} onChange={this.handleDataChange} />
        <Form.Select label={strings.labelProductionLine} name="productionLineId" options={productionLineOptions} value={data.productionLineId} onChange={this.handleDataChange} />
        <Form.Select label={strings.labelSeedBatch} name="seedBatchId" options={seedBatchOptions} value={data.seedBatchId} onChange={this.handleDataChange} />
        <Form.Select label={strings.labelPotType} name="potType" options={potTypeOptions} value={data.potType} onChange={this.handleDataChange} />
      </React.Fragment>
    );
  }


  /**
   * Renders table spread event form
   */
  private renderTableSpreadDataForm = (data: TableSpreadEventData) => {
    return (
      <React.Fragment>
        <Form.Input label={strings.labelTrayCount} name="trayCount" value={data.trayCount} onChange={this.handleDataChange} />
        <Form.Input label={strings.labelLocation} name="location" value={data.location} onChange={this.handleDataChange} />
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

    const phaseOptions = ['PLANTING', 'SOWING', 'PACKING', 'TABLE_SPREAD', 'CULTIVATION_OBSERVATION', 'HARVEST' ].map((phase) => {
      return {
        key: phase,
        value: phase,
        text: strings.getString(`phase${phase}`, strings.getLanguage())
      };
    })

    return (
      <React.Fragment>
        <Form.Select label={strings.labelWastageReason} name="reasonId" options={wastageReasonOptions} value={data.reasonId} onChange={this.handleDataChange} />
        <Form.Select label={strings.labelProductionLine} name="productionLineId" options={productionLineOptions} value={data.productionLineId} onChange={this.handleDataChange} />
        <Form.Select label={strings.labelPhase} name="phase" options={phaseOptions} value={data.phase} onChange={this.handleDataChange} />
        <Form.Input label={strings.labelAmount} name="amount" type="number" value={data.amount} onChange={this.handleDataChange} />
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
    const [teamsService, productionLinesService] = await Promise.all([
      Api.getTeamsService(this.props.keycloak),
      Api.getProductionLinesService(this.props.keycloak)
    ]);

    const [teams, productionLines] = await Promise.all([
      teamsService.listTeams(),
      productionLinesService.listProductionLines()
    ]);

    this.setState({
      teams: teams,
      loading: false,
      productionLines: productionLines
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
   * Loads data required for packing event
   */
  private loadPackingData = async () => {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({loading: true});
    const packageSizeService = await Api.getPackageSizesService(this.props.keycloak);
    const packageSizes = await packageSizeService.listPackageSizes();

    this.setState({
      loading: false,
      packageSizes: packageSizes
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
      productionLines: productionLines
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
      productionLines: productionLines
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
      productionLines: productionLines
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateEvent);