import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { Event, SowingEventData, TableSpreadEventData, CultivationObservationEventData, PlantingEventData, HarvestEventData, PackingEventData, WastageEventData } from "famifarm-typescript-models";
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import '../styles/batch-view.css';

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
import strings from "src/localization/strings";
import { NavLink } from "react-router-dom";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  batchId: string;
}


/**
 * Interface representing component state
 */
interface State {
  batchEvents: Event[]
  loading: boolean
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
  async componentDidMount() {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({ loading: true });
    
    const eventsService = await Api.getEventsService(this.props.keycloak);
    eventsService.listEvents(undefined, undefined, this.props.batchId).then((events) => {
      this.setState({
        batchEvents: events.sort((a, b) => moment(a.startTime).isAfter(moment(b.startTime)) ? 1 : -1), //TOOO: sort on server side
        loading: false
      });
    });
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
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "")}</small>
          </div> 
        );
      case "TABLE_SPREAD":
        eventData = event.data as TableSpreadEventData;
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.tablespreadEventHeader}</h3>
            <p>{strings.formatString(strings.tablespreadEventText, String(eventData.tableCount))}</p>
            <NavLink to={`/events/${event.id}`}><Button style={{float: "right"}}>{strings.editEventLink}</Button></NavLink>
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "")}</small>
          </div> 
        );
      case "CULTIVATION_OBSERVATION":
        eventData = event.data as CultivationObservationEventData;
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.observationsEventHeader}</h3>
            <p>{strings.formatString(strings.observationsEventText, String(eventData.luminance), String(eventData.weight))}</p>
            <NavLink to={`/events/${event.id}`}><Button style={{float: "right"}}>{strings.editEventLink}</Button></NavLink>
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "")}</small>
          </div> 
        );
      case "PLANTING":
        eventData = event.data as PlantingEventData;
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.plantingEventHeader}</h3>
            <p>{strings.formatString(strings.plantingEventText, String(eventData.gutterCount), String(eventData.workerCount))}</p>
            <NavLink to={`/events/${event.id}`}><Button style={{float: "right"}}>{strings.editEventLink}</Button></NavLink>
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "")}</small>
          </div> 
        );
      case "HARVEST":
        eventData = event.data as HarvestEventData;
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.harvestEventHeader}</h3>
            <p>{strings.formatString(strings.harvestEventText)}</p>
            <NavLink to={`/events/${event.id}`}><Button style={{float: "right"}}>{strings.editEventLink}</Button></NavLink>
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "")}</small>
          </div> 
        );
      case "PACKING":
        eventData = event.data as PackingEventData;
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.packingEventHeader}</h3> 
            <p>{strings.formatString(strings.packingEventText, String(eventData.packedAmount))}</p>
            <NavLink to={`/events/${event.id}`}><Button style={{float: "right"}}>{strings.editEventLink}</Button></NavLink>
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "")}</small>
          </div> 
        );
      case "WASTAGE":
        eventData = event.data as WastageEventData;
        return ( 
          <div>
            <h3 className="vertical-timeline-element-title">{strings.wastageEventHeader}</h3>
            <p>{strings.formatString(strings.wastageEventText, String(eventData.amount))}</p>
            <NavLink to={`/events/${event.id}`}><Button style={{float: "right"}}>{strings.editEventLink}</Button></NavLink>
            <small>{strings.formatString(strings.remainingUnitsText, event.remainingUnits ? event.remainingUnits.toString() : "")}</small>
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
          <Loader active size="medium" />
        </Grid>
      );
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

    return (
      <Grid>
        <Grid.Row>
          <VerticalTimeline>
            {timelineElements}
          </VerticalTimeline>
        </Grid.Row>
      </Grid>
    );
  }
}

export default BatchView;