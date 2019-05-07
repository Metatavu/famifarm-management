import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as _ from "lodash";
import Api from "../api";
import { Event, SowingEventData, TableSpreadEventData, CultivationObservationEventData, PlantingEventData, HarvestEventData, PackingEventData, WastageEventData } from "famifarm-typescript-models";
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
import packingIcon from "../gfx/icons/pakkaaminen-icon.png"
import harvestIcon from "../gfx/icons/sadonkorjuu-icon.png"

import {
  Grid,
  Loader,
  Icon,
  Button
} from "semantic-ui-react";
import * as moment from "moment";
import strings from "../localization/strings";
import { NavLink } from "react-router-dom";
import { ErrorMessage } from "../types";
import LocalizedUtils from "src/localization/localizedutils";

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
  loading: boolean,
  batchTitle?: string
}

/**
 * React component displaying events of single batch
 */
class BatchView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      batchEvents: [],
      loading: false
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
  
      this.setState({ loading: true });
      
      const eventsService = await Api.getEventsService(this.props.keycloak);
      const events = await eventsService.listEvents(undefined, undefined, this.props.batchId);
      
      this.setState({
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
      case "PACKING":
        return <img style={iconStyle} src={packingIcon} />
      case "WASTAGE":
        return <Icon style={{fontSize: "25px", paddingTop: "33%", textAlign: "center", width: "100%", color: "#2DA457"}} name="trash" />
      default:
        return <Icon name="question" />
    }
  }

  /**
   * Gets timeline content for event
   * 
   * @param event event to get the content for
   * @returns JSX element representing timeline event content
   */
  private getTimelineElementContent(event: Event): JSX.Element {
    let eventData = null;
    switch (event.type) {
      case "SOWING":
        eventData = event.data as SowingEventData;
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.sowingEventHeader}</h3>
            <p>{strings.formatString(strings.sowingEventText, eventData.amount)}</p>
            <NavLink to={`/events/${event.id}`}><Button style={{float: "right"}}>{strings.editEventLink}</Button></NavLink>
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "0")}</small>
          </div> 
        );
      case "TABLE_SPREAD":
        eventData = event.data as TableSpreadEventData;
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.tablespreadEventHeader}</h3>
            <p>{strings.formatString(strings.tablespreadEventText, String(eventData.trayCount))}</p>
            <NavLink to={`/events/${event.id}`}><Button style={{float: "right"}}>{strings.editEventLink}</Button></NavLink>
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "0")}</small>
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
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "0")}</small>
          </div> 
        );
      case "HARVEST":
        eventData = event.data as HarvestEventData;
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.harvestEventHeader}</h3>
            <p>{strings.formatString(strings.harvestEventText)}</p>
            <NavLink to={`/events/${event.id}`}><Button style={{float: "right"}}>{strings.editEventLink}</Button></NavLink>
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "0")}</small>
          </div> 
        );
      case "PACKING":
        eventData = event.data as PackingEventData;
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.packingEventHeader}</h3> 
            <p>{strings.formatString(strings.packingEventText, String(eventData.packedCount))}</p>
            <NavLink to={`/events/${event.id}`}><Button style={{float: "right"}}>{strings.editEventLink}</Button></NavLink>
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "0")}</small>
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
    if (this.state.loading) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1, paddingLeft: 10, paddingRight: 10}}>
          <Grid.Column width={12}>
          <h2>{ this.state.batchTitle || "" }</h2>
          </Grid.Column>
          <Grid.Column width={4} style={{ textAlign: "right" }}>
            <NavLink to={`/editBatch/${this.props.batchId}`}>
              <Button className="submit-button">{strings.editBatch}</Button>
            </NavLink>
            <NavLink to={`/createEvent/${this.props.batchId}`}>
              <Button className="submit-button">{strings.newEvent}</Button>
            </NavLink>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          { this.renderEvents() } 
        </Grid.Row>
      </Grid>
    );
  }

  private renderEvents() {
    if (!this.state.batchEvents.length) {
      return <div> { strings.batchNoEvents } </div>
    }

    const timelineElements = this.state.batchEvents.map((event) => {
      const startMoment = moment(event.startTime);
      const endMoment = moment(event.endTime);
      const dateString = startMoment.isSame(endMoment) ? startMoment.format("DD.MM.YYYY HH:mm") : `${moment(event.startTime).format("DD.MM.YYYY HH:mm")} - ${moment(event.endTime).format("DD.MM.YYYY HH:mm")}`;
      return (
        <VerticalTimelineElement
          key={event.id}
          date={dateString}
          icon={this.getEventIcon(event)}
          iconStyle={{ background: 'rgb(240, 240, 240)' }}
        >
          {this.getTimelineElementContent(event)}
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