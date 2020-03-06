import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as _ from "lodash";
import Api from "../api";
import { Event, SowingEventData, TableSpreadEventData, CultivationObservationEventData, PlantingEventData, HarvestEventData, WastageEventData, BatchPhase, PackageSize, EventType } from "famifarm-typescript-models";
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import '../styles/batch-view.css';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import observationsIcon from "../gfx/icons/havainnot-icon.png"
import sowingIcon from "../gfx/icons/kylvo-icon.png"
import plantingIcon from "../gfx/icons/istutus-icon.png"
import tablespreadIcon from "../gfx/icons/levitys-icon.png"
import harvestIcon from "../gfx/icons/sadonkorjuu-icon.png"

import {
  Grid,
  Loader,
  Icon,
  Button,
  Confirm
} from "semantic-ui-react";
import * as moment from "moment";
import strings from "../localization/strings";
import { NavLink, Redirect } from "react-router-dom";
import { ErrorMessage } from "../types";
import LocalizedUtils from "src/localization/localizedutils";
import LogWastageDialog from "./LogWastageDialog";

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
  batchEvents: Event[]
  packageSizes: PackageSize[]
  loading: boolean,
  batchTitle?: string
  phaseWastageInfo?: PhaseWastageInfo
  deleteBatchConfirmOpen: boolean
  deletionStatus: "NOT_DELETED" | "DELETING" | "DELETED",
  deleted: boolean
}

interface PhaseWastageInfo {
  loss: number
  phase: EventType
  startTime: string,
  endTime: string
  productionLineId?: string
}

/**
 * React component displaying events of single batch
 */
class BatchView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      packageSizes: [],
      batchEvents: [],
      loading: false,
      deleteBatchConfirmOpen: false,
      deletionStatus: "NOT_DELETED",
      deleted: false
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
  
      this.setState({ deleted: false, loading: true });
      
      const packgeSizesService = await Api.getPackageSizesService(this.props.keycloak);
      const packageSizes = await packgeSizesService.listPackageSizes();

      const eventsService = await Api.getEventsService(this.props.keycloak);
      const events = await eventsService.listEvents(undefined, undefined, this.props.batchId);
      
      this.setState({
        packageSizes: packageSizes,
        batchEvents: events.sort((a, b) => moment(a.startTime).isAfter(moment(b.startTime)) ? 1 : -1), //TOOO: sort on server side
        batchTitle: await this.resolveBatchTitle(events),
        loading: false
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
   * Gets icon for event
   * 
   * @param event event to get icon for
   * @returns JSX element representing the icon
   */
  private getEventIcon(event: Event): JSX.Element {
    const iconStyle = {
      maxWidth: "70%",
      margin: "15%"
    };
    switch (event.type) {
      case "SOWING":
        return <img style={iconStyle} src={sowingIcon} />
      case "TABLE_SPREAD":
        return <img style={{...iconStyle, marginTop: "45%"}} src={tablespreadIcon} />
      case "CULTIVATION_OBSERVATION":
        return <img style={iconStyle} src={observationsIcon} />
      case "PLANTING":
        return <img style={iconStyle} src={plantingIcon} />
      case "HARVEST":
        return <img style={{...iconStyle, maxWidth: "50%", marginLeft: "25%"}} src={harvestIcon} />
      case "WASTAGE":
        return <Icon style={{fontSize: "25px", paddingTop: "33%", textAlign: "center", width: "100%", color: "#2DA457"}} name="trash" />
      default:
        return <Icon name="question" />
    }
  }

  /**
   * Handles log wastage button click
   */
  private handleLogWastageClick = (event: Event) => {
    let loss = 0;
    let phase: EventType = "SOWING";
    let startTime = moment(event.startTime);
    startTime.add(1, "s");

    switch (event.type) {
      case "TABLE_SPREAD":
        phase = "TABLE_SPREAD";
        loss = (event.remainingUnits || 0) - this.getProcessedCount("TABLE_SPREAD");
      break;
      case "PLANTING":
        phase = "PLANTING";
        loss = (event.remainingUnits || 0) - this.getProcessedCount("PLANTING");
      break;
      case "HARVEST":
        phase = "HARVEST";
        loss = (event.remainingUnits || 0) - this.getProcessedCount("HARVEST");
      break;
    }

    let productionLineId = undefined;
    const plantingEvent = this.state.batchEvents.find((event) => event.type == "PLANTING");
    if (plantingEvent) {
      let eventData = plantingEvent.data as PlantingEventData;
      productionLineId = eventData.productionLineId;
    } else {
      const sowingEvent = this.state.batchEvents.find((event) => event.type == "SOWING");
      if (sowingEvent) {
        let eventData = sowingEvent.data as SowingEventData;
        productionLineId = eventData.productionLineId;
      }
    }

    if (loss > 0) {
      this.setState({
        phaseWastageInfo: {
          loss: loss,
          phase: phase,
          startTime: startTime.toISOString(),
          endTime: startTime.toISOString(),
          productionLineId: productionLineId
        }
      })
    } else {
      alert("Vaiheessa ei hävikkiä");
    }
  } 

  /**
   * Gets total number of processed units from batch during phase
   */
  private getProcessedCount = (phase: BatchPhase) => {
    const { batchEvents } = this.state;
    switch (phase) {
      case "SOWING":
        return this.getSowedCount(batchEvents);
      case "TABLE_SPREAD":
        return this.getTableSpreadCount(batchEvents);
      case "PLANTING":
        return this.getPlantedCount(batchEvents);
      case "HARVEST":
        return this.getHarvestedCount(batchEvents);
    }

    return 0;
  }

  /**
   * Gets total number of sowed units from list of events
   */
  private getSowedCount = (batchEvents: Event[]) => {
    let count = 0;
    const sowingEvents = batchEvents.filter((event) => event.type == "SOWING");
    for (let i = 0; i < sowingEvents.length; i++) {
      let potTypeCount = (sowingEvents[i].data as SowingEventData).potType == "SMALL" ? 54 : 35;
      let eventData = sowingEvents[i].data as SowingEventData;
      eventData.productionLineId
      count += eventData.amount ? eventData.amount * potTypeCount : 0;
    }
    return count;
  }

  /**
   * Gets total number of unit spread to tables from list of events
   */
  private getTableSpreadCount = (batchEvents: Event[]) => {
    const sowingEvent = batchEvents.find((event) => event.type == "SOWING");
    if (!sowingEvent) {
      return 0;
    }

    const potTypeCount = (sowingEvent.data as SowingEventData).potType == "SMALL" ? 54 : 35;
    let count = 0;
    const tableSpreadEvents = batchEvents.filter((event) => event.type == "TABLE_SPREAD");
    for (let i = 0; i < tableSpreadEvents.length; i++) {
      let eventData = tableSpreadEvents[i].data as TableSpreadEventData
      count += (eventData.trayCount || 0)  * potTypeCount;
    }

    return Math.round(count);
  }

  /**
   * Gets total number of planted units from list of events
   */
  private getPlantedCount = (batchEvents: Event[]) => {
    let count = 0;
    const plantingEvents = batchEvents.filter((event) => event.type == "PLANTING");
    for (let i = 0; i < plantingEvents.length; i++) {
      let eventData = plantingEvents[i].data as PlantingEventData;
      count += (eventData.gutterCount || 0) * (eventData.gutterHoleCount || 0);
    }

    return Math.round(count);
  }

  /**
   * Gets total number of havested units from list of events
   */
  private getHarvestedCount = (batchEvents: Event[]) => {
    let totalWeightedSize = 0;
    let totalGutterCount = 0;
    let harvestedGutterCount = 0;

    batchEvents.forEach((batchEvent) => {
      if (batchEvent.type == "PLANTING") {
        let plantingEventData = batchEvent.data as PlantingEventData;
        totalWeightedSize += (plantingEventData.gutterHoleCount || 0) * (plantingEventData.gutterCount || 0);
        totalGutterCount += plantingEventData.gutterCount || 0
      } else if (batchEvent.type == "HARVEST") {
        let harvestEventData = batchEvent.data as HarvestEventData;
        harvestedGutterCount += harvestEventData.gutterCount || 0;
      }
    });

    const gutterHoleCount = totalWeightedSize == 0 || totalGutterCount == 0 ? 0 : totalWeightedSize / totalGutterCount;
    return Math.round(gutterHoleCount * harvestedGutterCount);
  }

  /**
   * Gets processed count from single event
   */
  private getSingleProcessedCount = (event: Event) => {
    switch (event.type) {
      case "SOWING":
        return this.getSingleSowedCount(event);
      case "TABLE_SPREAD":
        return this.getSingleTableSpreadCount(event);
      case "CULTIVATION_OBSERVATION":
        return null;
      case "PLANTING":
        return this.getSinglePlantedCount(event);
      case "HARVEST":
        return this.getSingleHarvestedCount(event);
      case "WASTAGE":
        return (event.data as WastageEventData).amount;
      default:
        return null;
    }
  }

  /**
   * Gets processed count from single sowing event
   */
  private getSingleSowedCount = (event: Event) => {
    const eventData = event.data as SowingEventData;

    const potTypeCount = eventData.potType == "SMALL" ? 54 : 35;
    const count = (eventData.amount || 0)  * potTypeCount;

    return Math.round(count);
  }

  /**
   * Gets processed count from single table spread event
   */
  private getSingleTableSpreadCount = (event: Event) => {
    const sowingEvent = this.state.batchEvents.find((e) => e.type == "SOWING");
    if (!sowingEvent) {
      return 0;
    }

    const potTypeCount = (sowingEvent.data as SowingEventData).potType == "SMALL" ? 54 : 35;
    const eventData = event.data as TableSpreadEventData;
    const count = (eventData.trayCount || 0)  * potTypeCount;

    return Math.round(count);
  }

  /**
   * Gets processed count from single planting event
   */
  private getSinglePlantedCount = (event: Event) => {
    const eventData = event.data as PlantingEventData;
    const count = (eventData.gutterCount || 0) * (eventData.gutterHoleCount || 0);

    return Math.round(count);
  }

  /**
   * Gets processed count from single harvest event
   */
  private getSingleHarvestedCount = (event: Event) => {
    let totalWeightedSize = 0;
    let totalGutterCount = 0;
    const harvestedGutterCount = (event.data as HarvestEventData).gutterCount || 0;

    this.state.batchEvents.forEach((batchEvent) => {
      if (batchEvent.type == "PLANTING") {
        let plantingEventData = batchEvent.data as PlantingEventData;
        totalWeightedSize += (plantingEventData.gutterHoleCount || 0) * (plantingEventData.gutterCount || 0);
        totalGutterCount += plantingEventData.gutterCount || 0
      }
    });

    const gutterHoleCount = totalWeightedSize == 0 || totalGutterCount == 0 ? 0 : totalWeightedSize / totalGutterCount;
    return Math.round(gutterHoleCount * harvestedGutterCount);
  }

  /**
   * Gets timeline content for event
   * 
   * @param event event to get the content for
   * @returns JSX element representing timeline event content
   */
  private getTimelineElementContent(event: Event, showLogWastage: boolean): JSX.Element {
    let eventData = null;
    const processedUnits = this.getSingleProcessedCount(event);
    switch (event.type) {
      case "SOWING":
        eventData = event.data as SowingEventData;
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.sowingEventHeader}</h3>
            <p>{strings.formatString(strings.sowingEventText, eventData.amount)}</p>
            <NavLink to={`/events/${event.id}`}><Button style={{float: "right"}}>{strings.editEventLink}</Button></NavLink>
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "0")}</small>
            <br/>
            <small>{strings.formatString(strings.processedUnitsText, processedUnits ? processedUnits.toString() : "0")}</small>
          </div> 
        );
      case "TABLE_SPREAD":
        eventData = event.data as TableSpreadEventData;
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.tablespreadEventHeader}</h3>
            <p>{strings.formatString(strings.tablespreadEventText, String(eventData.trayCount))}</p>
            <NavLink to={`/events/${event.id}`}><Button style={{float: "right"}}>{strings.editEventLink}</Button></NavLink>
            {showLogWastage && <Button style={{float: "right"}} onClick={() => this.handleLogWastageClick(event)}>{strings.logPhaseWastage}</Button>}
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "0")}</small>
            <br/>
            <small>{strings.formatString(strings.processedUnitsText, processedUnits ? processedUnits.toString() : "0")}</small>
          </div> 
        );
      case "CULTIVATION_OBSERVATION":
        eventData = event.data as CultivationObservationEventData;
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.observationsEventHeader}</h3>
            {eventData.luminance && 
              <p>{strings.formatString(strings.luminanceObservationText, String(eventData.luminance))}</p>
            }
            {eventData.weight && 
              <p>{strings.formatString(strings.weightObservationText, String(eventData.weight))}</p>
            }
            {eventData.pestIds && eventData.pestIds.length > 0 && 
              <p>{strings.pestObservationText}</p>
            }
            <NavLink to={`/events/${event.id}`}><Button style={{float: "right"}}>{strings.editEventLink}</Button></NavLink>
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "0")}</small>
          </div> 
        );
      case "PLANTING":
        eventData = event.data as PlantingEventData;
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.plantingEventHeader}</h3>
            <p>{strings.formatString(strings.plantingEventText, String(eventData.gutterCount), String(eventData.workerCount))}</p>
            <NavLink to={`/events/${event.id}`}><Button style={{float: "right"}}>{strings.editEventLink}</Button></NavLink>
            {showLogWastage && <Button style={{float: "right"}} onClick={() => this.handleLogWastageClick(event)}>{strings.logPhaseWastage}</Button>}
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "0")}</small>
            <br/>
            <small>{strings.formatString(strings.processedUnitsText, processedUnits ? processedUnits.toString() : "0")}</small>
          </div> 
        );
      case "HARVEST":
        eventData = event.data as HarvestEventData;
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.harvestEventHeader}</h3>
            <p>{strings.formatString(strings.harvestEventText)}</p>
            <NavLink to={`/events/${event.id}`}><Button style={{float: "right"}}>{strings.editEventLink}</Button></NavLink>
            {showLogWastage && <Button style={{float: "right"}} onClick={() => this.handleLogWastageClick(event)}>{strings.logPhaseWastage}</Button>}
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "0")}</small>
            <br/>
            <small>{strings.formatString(strings.processedUnitsText, processedUnits ? processedUnits.toString() : "0")}</small>
          </div> 
        );
      case "WASTAGE":
        eventData = event.data as WastageEventData;
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.wastageEventHeader}</h3>
            <p>{strings.formatString(strings.wastageEventText, String(eventData.amount))}</p>
            <NavLink to={`/events/${event.id}`}><Button style={{float: "right"}}>{strings.editEventLink}</Button></NavLink>
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "0")}</small>
            <br/>
            <small>{strings.formatString(strings.processedUnitsText, processedUnits ? processedUnits.toString() : "0")}</small>
          </div> 
        );
      default:
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.unknownEventHeader}</h3>
          </div> 
        );
    }
  }

  /**
   * Render edit batch view
   */
  public render() {
    if (this.state.deleted) {
      return (<Redirect to="/batches" />);
    }
    if (this.state.loading) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    let deleteConfirmText = "";
    switch(this.state.deletionStatus) {
      case "DELETED":
        deleteConfirmText = strings.batchDeletionSuccess;
      break;
      case "DELETING":
        deleteConfirmText = strings.batchDeletingInProgress;
      break;
      default:
        deleteConfirmText = strings.deleteBatchConfirmText;
      break;
    }

    return (
      <Grid>
        <Confirm 
          open={this.state.deleteBatchConfirmOpen}
          size={"mini"} 
          content={deleteConfirmText}
          onCancel={()=>this.setState({deleteBatchConfirmOpen:false})}
          onConfirm={this.handleDelete} />
        <Grid.Row className="content-page-header-row" style={{flex: 1, paddingLeft: 10, paddingRight: 10}}>
          <Grid.Column width={12}>
          <h2>{ this.state.batchTitle || "" }</h2>
          </Grid.Column>
          <Grid.Column width={2} style={{ textAlign: "right" }}>
            <Button onClick={this.promptDeleteBatch} negative>{strings.deleteBatchButtonText}</Button>
          </Grid.Column>
          <Grid.Column width={2} style={{ textAlign: "right" }}>
            <NavLink to={`/editBatch/${this.props.batchId}`}>
              <Button className="submit-button">{strings.editBatch}</Button>
            </NavLink>
          </Grid.Column>
          <Grid.Column width={2} style={{ textAlign: "right" }}>
            <NavLink to={`/createEvent/${this.props.batchId}`}>
              <Button className="submit-button">{strings.newEvent}</Button>
            </NavLink>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          { this.renderEvents() } 
        </Grid.Row>
        {this.state.phaseWastageInfo && (
          <LogWastageDialog
            open={true}
            keycloak={this.props.keycloak}
            batchId={this.props.batchId}
            startTime={this.state.phaseWastageInfo.startTime}
            endTime={this.state.phaseWastageInfo.endTime}
            loss={this.state.phaseWastageInfo.loss}
            phase={this.state.phaseWastageInfo.phase}
            productionLineId={this.state.phaseWastageInfo.productionLineId}
            onSuccess={(event) => this.setState({phaseWastageInfo: undefined, batchEvents: [...this.state.batchEvents].concat(event)})}
            onClose={() => this.setState({phaseWastageInfo: undefined})} />
        )}
      </Grid>
    );
  }

  /**
   * Shows delete confirmation dialog
   */
  private promptDeleteBatch = () => {
    this.setState({
      deleteBatchConfirmOpen: true
    });
  }

  /**
   * Handles deletion of batch
   */
  private handleDelete = async() => {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({
      deletionStatus: "DELETING"
    });

    try {
      const batchesService = await Api.getBatchesService(this.props.keycloak);
      await batchesService.deleteBatch(this.props.batchId);
      this.setState({
        deletionStatus: "DELETED"
      });
      setTimeout(() => {
        this.setState({
          deleted: true
        });
      })
    } catch(e) {
      alert(strings.batchDeletionError);
      this.setState({
        deletionStatus: "NOT_DELETED",
        deleteBatchConfirmOpen: false
      });
    }

  }

  private renderEvents() {
    if (!this.state.batchEvents.length) {
      return <div> { strings.batchNoEvents } </div>
    }

    const timelineElements = this.state.batchEvents.map((event, i) => {
      const isLastEvent = i === (this.state.batchEvents.length - 1);
      const startMoment = moment(event.startTime);
      const endMoment = moment(event.endTime);
      const showLogWastage = isLastEvent && (event.type === "TABLE_SPREAD" || event.type === "PLANTING" || event.type === "HARVEST" );
      const dateString = startMoment.isSame(endMoment) ? startMoment.format("DD.MM.YYYY HH:mm") : `${moment(event.startTime).format("DD.MM.YYYY HH:mm")} - ${moment(event.endTime).format("DD.MM.YYYY HH:mm")}`;
      return (
        <VerticalTimelineElement
          key={event.id}
          date={dateString}
          icon={this.getEventIcon(event)}
          iconStyle={{ background: 'rgb(240, 240, 240)' }}
        >
          {this.getTimelineElementContent(event, showLogWastage)}
        </VerticalTimelineElement>
      );
    });

    return <VerticalTimeline> { timelineElements } </VerticalTimeline>
  }

  /**
   * Resolves batch'es title
   * 
   * @param events batch events
   * @return batch'es title
   */
  private async resolveBatchTitle(events: Event[]) {
    if (!this.props.keycloak) {
      return "";
    }

    const batchesService = await Api.getBatchesService(this.props.keycloak);
    const productionLinesService = await Api.getProductionLinesService(this.props.keycloak);
    const productsService = await Api.getProductsService(this.props.keycloak);

    const batch = await batchesService.findBatch(this.props.batchId);
    if (!batch) {
      return "";
    }

    const product = await productsService.findProduct(batch.productId);
    if (!product) {
      return "";
    }

    const productionLineIds: string[] = _.uniq(events
      .filter((event) => {
        return event.type == "PLANTING";
      })
      .map((event) => {
        const plantingData: PlantingEventData = (event as any).data;
        return plantingData.productionLineId;
      }))
      .filter((productionLineId) => {
        return !!productionLineId;
      }) as string[];

    const productionLines = await Promise.all(productionLineIds.map((productionLineId) => {
      return productionLinesService.findProductionLine(productionLineId);
    }));

    const lineNumbers = productionLines
      .filter((productionLine) => {
        return !!productionLine.lineNumber;
      })
      .map((productionLine) => {
        return productionLine.lineNumber!;
      }).join(",");

    return `${LocalizedUtils.getLocalizedValue(product.name)}${!lineNumbers ? "" : " - " + lineNumbers}`;
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

export default connect(mapStateToProps, mapDispatchToProps)(BatchView);