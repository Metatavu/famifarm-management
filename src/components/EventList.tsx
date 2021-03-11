import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Event, EventType, Product, ProductionLine, SowingEventData } from "../generated/client";
import strings from "src/localization/strings";
import * as moment from "moment";
import * as actions from "../actions";
import { StoreState, ErrorMessage, EventListFilters } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  List,
  Button,
  Grid,
  Loader,
  Label,
  Form,
  InputOnChangeData,
  TextAreaProps,
  Visibility
} from "semantic-ui-react";
import { DateInput } from 'semantic-ui-calendar-react';
import LocalizedUtils from "src/localization/localizedutils";


/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  events: Event[];
  eventListFilters?: EventListFilters;
  products?: Product[];
  location?: any,
  onEventListFiltersUpdated?: (filters: EventListFilters) => void,
  onEventsFound?: (events: Event[]) => void,
  onProductsFound?: (products: Product[]) => void,
  onError?: (error: ErrorMessage) => void
}

/**
 * Interface representing component state
 */
interface State {
  status: string
  loading: boolean
  errorCount: number,
  loadingFirstTime: boolean,
  productionLines: ProductionLine[]
}

/**
 * React component for displaying list of batches
 */
class EventList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      productionLines: [],
      status: "OPEN",
      loading: false,
      errorCount: 0,
      loadingFirstTime: false
    };;
  }

  /**
   * Component did mount life-sycle event
   */
  public async componentDidMount() {
    try {
      if (this.props.keycloak) {
        const productionLinesService = await Api.getProductionLinesService(this.props.keycloak);
        const productionLines = await productionLinesService.listProductionLines({});
        this.setState({
          productionLines: productionLines
        });
      }
      
      await this.updateEvents(this.props.eventListFilters || {});
    } catch(e) {
      console.error(e);
    }
  }

  private getEventName = (event: Event): string => {
    const products = this.props.products || [];
    const eventProduct = products.find((product) => product.id === event.productId);
    const productName = eventProduct ? LocalizedUtils.getLocalizedValue(eventProduct.name) : event.id;
    const batchDate = moment(event.startTime).format("DD.MM.YYYY");
    const eventTypeString = strings[`phase${event.type}`];
    let extra = "";
    if (event.type == EventType.Sowing) {
      const productionLine = this.state.productionLines.find(line => line.id == (event.data as SowingEventData).productionLineId);
      extra = productionLine && productionLine.lineNumber ? `- ${strings.productionLine}: ${productionLine.lineNumber}` : "";
    }


    return `${productName} - ${eventTypeString} - ${batchDate} ${extra}`;
  }

  /**
   * Render batch list view
   */
  public render() {
    if (this.state.loading && this.state.loadingFirstTime) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    const possibleLoader = (): any => {
      if (this.state.loading) {
        return <Loader inline active size="medium" />
      }
    }

    /*const statusButtons = ["OPEN", "CLOSED", "NEGATIVE"].map((status: string) => {
      return (
        <Button onClick={() => this.handleButtonClick(status)} key={status} active={this.state.status === status} >
          {strings.getString(`batchStatusButton${status}`, strings.getLanguage())}
          {status === "NEGATIVE" && this.state.errorCount > 0 &&
            <Label style={{position: "absolute", top: "5px"}} size="mini" circular color='red'>{this.state.errorCount}</Label>
          }
        </Button>
      );
    });*/

    const batches = (this.props.events || []).map((event, i) => {
      return (
        <List.Item style={i % 2 == 0 ? {backgroundColor: "#ddd"} : {}} key={event.id}>
          <List.Content floated='right'>
            <NavLink to={`/events/${event.id}`}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Content>
            <List.Header style={{paddingTop: "10px"}}>{this.getEventName(event)}</List.Header>
          </List.Content>
        </List.Item>
      );
    });

    const { eventListFilters } = this.props;
    const productText = eventListFilters && eventListFilters.product ? LocalizedUtils.getLocalizedValue(eventListFilters.product.name) : strings.selectProduct
    const dateText = eventListFilters && eventListFilters.date ? moment(eventListFilters.date).format("DD.MM.YYYY") : ""
    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.events}</h2>
          <NavLink to="/createEvent">
            <Button className="submit-button">{strings.newEvent}</Button>
          </NavLink>
        </Grid.Row>
        <Grid.Row>
          <Form>
            <Form.Field>
              <div style={{display:"inline-block", paddingTop: "2rem", paddingBottom: "2rem", paddingRight: "2rem"}}>
                <label>{strings.date}</label>
                <DateInput dateFormat="DD.MM.YYYY" onChange={this.onChangeDate} name="date" value={dateText} />
              </div>
              <div style={{display:"inline-block", paddingTop: "2rem", paddingBottom: "2rem"}}>
                <label>{strings.productName}</label>
                <Form.Select name="product" options={this.renderOptions()} text={productText} onChange={this.onChangeProduct} />
              </div>
            </Form.Field>
          </Form>
        </Grid.Row>
        <Grid.Row>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
          <Visibility onUpdate={this.loadMoreEvents}>
            <List divided animated verticalAlign='middle'>
              {batches}
            </List>
          </Visibility>
          </Grid.Column>
        </Grid.Row>
        {possibleLoader()}
      </Grid>
    );
  }

  /**
   * Handles status button click
   */
  /*private handleButtonClick = (status: string) => {
    this.setState({
      status: status
    });
    this.updateBatches(status, 0, this.props.eventsListDate, this.props.eventsProduct, this.props.eventsProductName).catch((err) => {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: err
      });
    });
  }*/

  /**
   * Handles changing date
   */
  private onChangeDate = async (e: any, { value }: InputOnChangeData) => {
    const date =  moment(value, "DD.MM.YYYY");
    await this.updateEvents({...this.props.eventListFilters, date: date.toDate()});
  }

  /**
   * Handles changing selected product
   */
  private onChangeProduct = async (e: any, { name, value }: InputOnChangeData | TextAreaProps) => {
    const product = (this.props.products || []).find(product => product.id === value);
    await this.updateEvents({...this.props.eventListFilters, product});
  }

  /**
   * Renders dropdown options
   */
  private renderOptions = () => {
    if (this.props.products) {
      let options = [{text: strings.allProducts, value: ""}];
      for (let i = 0; i < this.props.products.length; i++) {
        options.push({text: LocalizedUtils.getLocalizedValue(this.props.products[i].name) || "", value: this.props.products[i].id || ""});
      }
      return options;
    } else {
      return [{text:"", value:""}];
    }
  }

  /**
   * Loads more batches
   */
  private loadMoreEvents = async (e: any, { calculations }: any) => {
    const { eventListFilters } = this.props;
    if (calculations.bottomVisible === true && !this.state.loading) {
      const firstResult = ((eventListFilters || {}).firstResult || 0) + 20;
      await this.updateEvents({...eventListFilters, firstResult});
    }
  }

  /**
   * Updates batch list
   */
  private updateEvents = async (filters: EventListFilters) => {
    if (!this.props.keycloak) {
      return;
    }
    const dateFilter = filters.date ? moment(filters.date) : moment();
    const createdBefore = dateFilter.endOf("day").toISOString();
    const createdAfter = dateFilter.startOf("day").toISOString();
    const firstResult = filters.firstResult || 0;
    this.setState({loading: true});
    try {
      const [eventsService, productsService] = await Promise.all([
        Api.getEventsService(this.props.keycloak),
        Api.getProductsService(this.props.keycloak)
      ]);

      const [events, products] = await Promise.all([
        eventsService.listEvents({
          productId: filters.product ? filters.product.id : undefined,
          createdAfter: createdAfter,
          createdBefore: createdBefore,
          firstResult: firstResult,
          maxResults: 20
        }),
        productsService.listProducts({}),
      ]);

      const updatedEvents = firstResult > 0 ? [...(this.props.events || []), ...events] : events;
      this.props.onEventsFound && this.props.onEventsFound(updatedEvents);
      this.props.onEventListFiltersUpdated && this.props.onEventListFiltersUpdated({
        date: dateFilter.toDate(),
        firstResult: firstResult,
        product: filters.product || undefined
      })
      this.props.onProductsFound && this.props.onProductsFound(products);
      this.setState({loading: false, loadingFirstTime: false})
    } catch(e) {
      this.props.onError && this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }
}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    products: state.products,
    eventListFilters: state.eventListFilters,
    events: state.events
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onProductsFound: (products: Product[]) => dispatch(actions.productsFound(products)),
    onEventListFiltersUpdated: (filters: EventListFilters) => dispatch(actions.eventListFiltersUpdated(filters)),
    onEventsFound: (events: Event[]) => dispatch(actions.eventsFound(events)),
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EventList);