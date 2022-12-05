import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Event, EventType, Facility, Product, ProductionLine, SowingEventData } from "../generated/client";
import strings from "../localization/strings";
import moment from "moment";
import * as actions from "../actions";
import { StoreState, ErrorMessage, EventListFilters } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  Button,
  Grid,
  Loader,
  Form,
  DropdownProps,
  TextAreaProps,
  Visibility,
  Table
} from "semantic-ui-react";
import { DateInput } from 'semantic-ui-calendar-react';
import LocalizedUtils from "../localization/localizedutils";


/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  events: Event[];
  eventListFilters?: EventListFilters;
  products?: Product[];
  location?: any,
  facility: Facility;
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
    const { keycloak, facility, eventListFilters } = this.props;
    try {
      if (keycloak) {
        const productionLinesService = await Api.getProductionLinesService(keycloak);
        const productionLines = await productionLinesService.listProductionLines({ facility: facility });
        this.setState({
          productionLines: productionLines
        });
      }
      
      await this.updateEvents(eventListFilters || {});
    } catch(e) {
      console.error(e);
    }
  }

  private renderEventTableRow = (event: Event) => {
    const products = this.props.products || [];
    const eventProduct = products.find((product) => product.id === event.productId);
    const productName = eventProduct ? LocalizedUtils.getLocalizedValue(eventProduct.name) : event.id;
    const startTime = moment(event.startTime).format("DD.MM.YYYY");
    const eventTypeString = strings[`phase${event.type}`];
    const eventData = event.data as any;
    const productionLine = eventData.productionLineId ? this.state.productionLines.find(line => line.id == eventData.productionLineId) : undefined;
    if (this.props.eventListFilters && this.props.eventListFilters.productionLine) {
      if (!productionLine) {
        return null;
      }
      if (productionLine.id !== this.props.eventListFilters.productionLine.id) {
        return null;
      }
    }
    const productionLineText = productionLine ? productionLine.lineNumber || "" : "";
    const gutterCountText = eventData.gutterCount !== undefined ? eventData.gutterCount : "";
    const gutterHoleCountText = eventData.gutterHoleCount !== undefined ? eventData.gutterHoleCount : "";

    return (
      <Table.Row key={event.id}>
        <Table.Cell>{ productName }</Table.Cell>
        <Table.Cell>{ eventTypeString }</Table.Cell>
        <Table.Cell>{ startTime }</Table.Cell>
        <Table.Cell>{ productionLineText }</Table.Cell>
        <Table.Cell>{ gutterCountText }</Table.Cell>
        <Table.Cell>{ gutterHoleCountText }</Table.Cell>
        <Table.Cell textAlign='right'>
          <NavLink to={`/events/${event.id}`}>
              <Button className="submit-button">{strings.open}</Button>
          </NavLink>
        </Table.Cell>
      </Table.Row>
    )
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
        return <Loader 
          style={{ marginLeft: "auto", marginRight: "auto" }}
          inline
          active
          size="medium" />
      }
    }

    const tableRows = (this.props.events || []).map((event, i) => this.renderEventTableRow(event));

    const { eventListFilters } = this.props;
    const productText = eventListFilters && eventListFilters.product ? LocalizedUtils.getLocalizedValue(eventListFilters.product.name) : strings.selectProduct;
    const dateText = eventListFilters && eventListFilters.date ? moment(eventListFilters.date).format("DD.MM.YYYY") : "";
    const typeFilterText = eventListFilters && eventListFilters.type ? strings[`phase${eventListFilters.type}`] : strings.allEventTypes;
    const lineFilterText = eventListFilters && eventListFilters.productionLine ? eventListFilters.productionLine.lineNumber : strings.allProductionLines;
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
              <div style={{display:"inline-block", paddingTop: "2rem", paddingBottom: "2rem"}}>
                <label>{strings.labelEventType}</label>
                <Form.Select name="event-type" options={this.renderEventTypeOptions()} text={typeFilterText} onChange={this.onChangeEventTypeFilter} />
              </div>
              <div style={{display:"inline-block", paddingTop: "2rem", paddingBottom: "2rem"}}>
                <label>{strings.labelProductionLine}</label>
                <Form.Select name="event-production-line" options={this.renderProductionLineOptions()} text={lineFilterText} onChange={this.onChangeProductionLineFilter} />
              </div>
            </Form.Field>
          </Form>
        </Grid.Row>
        <Grid.Row>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
          <Visibility onUpdate={this.loadMoreEvents}>
            <Table selectable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>{ strings.product }</Table.HeaderCell>
                  <Table.HeaderCell>{ strings.labelEventType }</Table.HeaderCell>
                  <Table.HeaderCell>{ strings.labelStartTime }</Table.HeaderCell>
                  <Table.HeaderCell>{ strings.labelProductionLine }</Table.HeaderCell>
                  <Table.HeaderCell>{ strings.labelGutterCount }</Table.HeaderCell>
                  <Table.HeaderCell>{ strings.labelGutterHoleCount }</Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                { tableRows }
              </Table.Body>
            </Table>
          </Visibility>
          </Grid.Column>
        </Grid.Row>
        {possibleLoader()}
      </Grid>
    );
  }

  /**
   * Handles changing date
   */
  private onChangeDate = async (e: any, { value }: DropdownProps) => {
    const date =  moment(value as any, "DD.MM.YYYY");
    await this.updateEvents({...this.props.eventListFilters, date: date.toDate()});
  }

  /**
   * Handles changing selected product
   */
  private onChangeProduct = async (e: any, { name, value }: DropdownProps | TextAreaProps) => {
    const product = (this.props.products || []).find(product => product.id === value);
    await this.updateEvents({...this.props.eventListFilters, product});
  }

  /**
   * Handles changing selected product
   */
  private onChangeEventTypeFilter = async (e: any, { name, value }: DropdownProps | TextAreaProps) => {
    const type = (value || undefined) as any;
    await this.updateEvents({...this.props.eventListFilters, type});
  }

  /**
   * Handles the change of production line filter
   */
  private onChangeProductionLineFilter = (e: any, { name, value }: DropdownProps | TextAreaProps) => {
    const productionLine = (this.state.productionLines || []).find(productionLine => productionLine.id === value);
    this.props.onEventListFiltersUpdated && this.props.onEventListFiltersUpdated({
      ...this.props.eventListFilters,
      productionLine
    });
  }

  private renderProductionLineOptions = () => {
    return [{text: strings.allProductionLines, value: ""}]
      .concat(
      this.state.productionLines.map(p => {
        return { text: p.lineNumber!, value: p.id! }
      }));
  }

  /**
   * Renders dropdown options
   */
    private renderEventTypeOptions = () => {
      return [{text: strings.allEventTypes, value: ""}].concat([
        EventType.Sowing,
        EventType.TableSpread,
        EventType.Planting,
        EventType.Planting,
        EventType.CultivationObservation,
        EventType.Harvest,
        EventType.Wastage
      ].map(eventType => {
        return { text: strings[`phase${eventType}`], value: eventType  }
      }));
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

  private filtersChanged = (filters: EventListFilters, prevFilters?: EventListFilters): boolean => {
    if (!prevFilters) {
      return true;
    }

    const dateChanged = prevFilters.date !== filters.date;
    const productChanged = prevFilters.product !== filters.product;
    const typeChanged = prevFilters.type !== filters.type;
    return dateChanged || productChanged || typeChanged
  }

  /**
   * Updates batch list
   */
  private updateEvents = async (filters: EventListFilters) => {
    const { keycloak, facility, eventListFilters, onError, onEventListFiltersUpdated, onEventsFound, onProductsFound } = this.props;
    if (!keycloak) {
      return;
    }
    const prevFilters = eventListFilters;
    const dateFilter = filters.date ? moment(filters.date) : moment();
    const createdBefore = dateFilter.endOf("day").toISOString();
    const createdAfter = dateFilter.startOf("day").toISOString();
    const firstResult = this.filtersChanged(filters, prevFilters) ? 0 : filters.firstResult || 0;
    this.setState({loading: true});
    try {
      const [eventsService, productsService] = await Promise.all([
        Api.getEventsService(keycloak),
        Api.getProductsService(keycloak)
      ]);

      const [events, products] = await Promise.all([
        eventsService.listEvents({
          eventType: filters.type,
          productId: filters.product ? filters.product.id : undefined,
          createdAfter: createdAfter,
          createdBefore: createdBefore,
          firstResult: firstResult,
          maxResults: 20,
          facility: facility
        }),
        productsService.listProducts({ facility: facility }),
      ]);

      const updatedEvents = firstResult > 0 ? [...(this.props.events || []), ...events] : events;
      onEventsFound && onEventsFound(updatedEvents);
      onEventListFiltersUpdated && onEventListFiltersUpdated({
        date: dateFilter.toDate(),
        firstResult: firstResult,
        product: filters.product || undefined,
        type: filters.type
      });
      onProductsFound && onProductsFound(products);
      this.setState({loading: false, loadingFirstTime: false})
    } catch(e: any) {
      onError && onError({
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
    events: state.events,
    facility: state.facility
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
     onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EventList);