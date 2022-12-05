import { CutPacking, Facility, Product } from "../generated/client";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import Api from "../api";
import strings from "../localization/strings";
import LocalizedUtils from "../localization/localizedutils";
import { Button, Form, Grid, DropdownProps, List, Loader } from "semantic-ui-react";
import { NavLink } from "react-router-dom";
import { DateInput } from 'semantic-ui-calendar-react';
import moment from "moment";
import { ErrorMessage, StoreState } from "../types";
import { Dispatch } from "redux";
import * as actions from "../actions";
import { connect } from "react-redux";

interface Props {
  keycloak?: KeycloakInstance;
  products?: Product[];
  facility: Facility;
  onProductsFound: typeof actions.productsFound;
  onError: typeof actions.onErrorOccurred;
}

interface State {
  listItems: PackingListItem[];
  loading: boolean;
  createdBeforeFilter?: string;
  createdAfterFilter?: string;
  selectedProductName?: string;
  selectedProductId?: string;
}

/**
 * Interfaces describing an item rendered on the list
 */
interface PackingListItem {
  name: string;
  id: string;
}

class CutPackingsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      listItems: [],
      loading: false
    };
  }

  /**
   * Loads the list and product options
   */
  public componentDidMount = async () => {
    const { keycloak, products, facility, onProductsFound, onError } = this.props;

    if (!keycloak ) {
      return;
    }

    this.setState({ loading: true });

    try {
      const cutPackingsApi= await Api.getCutPackingsService(keycloak);
      const cutPackings = await cutPackingsApi.listCutPackings({ facility: facility });
  
      if (products) {
        const listItems = this.getListItems(cutPackings, products);
        this.setState({ listItems, loading: false });
      } else {
        const productsApi = await Api.getProductsService(keycloak);
        const foundProducts = await productsApi.listProducts({ facility: facility });
        const listItems = this.getListItems(cutPackings, foundProducts);
  
        onProductsFound(foundProducts);
        this.setState({ listItems, loading: false });
      }
    } catch (exception: any) {
      console.log(exception);
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception
      });
    }
  }

  public render = () => {
    const { loading, createdAfterFilter, createdBeforeFilter, selectedProductName } = this.state;

    if (loading) {
      return (
        <Grid style={{ paddingToSWSsp: "100px" }} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{ flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10 }}>
          <h2>{ strings.cutPackings }</h2>
          <NavLink to="/createCutPacking">
            <Button className="submit-button">{ strings.newPacking }</Button>
          </NavLink>
        </Grid.Row>
        <Grid.Row>
          <Form>
            <Form.Field>
              <div style={{ display:"inline-block", paddingTop: "2rem", paddingBottom: "2rem", paddingRight: "2rem" }}>
                <label>{ strings.dateBefore }</label>
                <DateInput dateFormat="DD.MM.YYYY" onChange={ this.onChangeCreatedBefore } name="dateBefore" value={ createdBeforeFilter ? moment(createdBeforeFilter).format("DD.MM.YYYY") : "" } />
              </div>

              <div style={{ display:"inline-block", paddingTop: "2rem", paddingBottom: "2rem", paddingRight: "2rem" }}>
                <label>{ strings.dateAfter }</label>
                <DateInput dateFormat="DD.MM.YYYY" onChange={ this.onChangeCreatedAfter } name="dateAfter" value={ createdAfterFilter ? moment(createdAfterFilter).format("DD.MM.YYYY") : "" } />
              </div>

              <div style={{ display:"inline-block", paddingTop: "2rem", paddingBottom: "2rem", paddingRight: "2rem" }}>
                <label>{ strings.productName }</label>
                <Form.Select name="product" options={ this.renderProductOptions() } text={ selectedProductName ? selectedProductName : strings.selectProduct } onChange={ this.onChangeProduct } />
              </div>
            </Form.Field>
          </Form>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List divided animated verticalAlign='middle'>
              { this.renderListItems() }
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  /**
   * Updates the list
   * 
   * @param productId return only packings belonging to this product
   * @param createdBefore return only packings created before this date
   * @param createdAfter return only packings created after this date
   */
  private updatePackingsList = async (productId?: string, createdBefore?: string, createdAfter?: string) => {
    const { keycloak, products, facility, onError } = this.props;

    if (!keycloak || !products) {
      return;
    }

    try {
      this.setState({ loading: true });
      const cutPackingsApi = await Api.getCutPackingsService(keycloak);
      const cutPackings = await cutPackingsApi.listCutPackings({
        productId: productId,
        createdAfter: createdAfter,
        createdBefore: createdBefore,
        facility: facility
      });
      const listItems = this.getListItems(cutPackings, products);
  
      this.setState({ listItems, loading: false });
    } catch (exception: any) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception
      });
    }
  }

  /**
   * Renders product options
   */
  private renderProductOptions = (): { text: string, value: string }[] => {
    const { products } = this.props;

    if (!products) {
      return [];
    }

    let options = [{ text: strings.allProducts, value: "" }];
    for (let i = 0; i < products.length; i++) {
      options.push({ text: LocalizedUtils.getLocalizedValue(products[i].name) || "", value: products[i].id || "" });
    }
    
    return options;
  }

  /**
   * Handles changing "created after"-date filter
   */
  private onChangeCreatedAfter = async (e: any, { value }: DropdownProps) => {
    this.setState({ createdAfterFilter: moment(value as any, "DD.MM.YYYY").toISOString() });
    await this.updatePackingsList(this.state.selectedProductId, this.state.createdBeforeFilter, moment(value as any, "DD.MM.YYYY").toISOString());
  }

  /**
   * Handles changing "created before"-date filter
   */
  private onChangeCreatedBefore = async (e: any, { value }: DropdownProps) => {
    this.setState({ createdBeforeFilter: moment(value as any, "DD.MM.YYYY").toISOString() });
    await this.updatePackingsList(this.state.selectedProductId, moment(value as any, "DD.MM.YYYY").toISOString(), this.state.createdAfterFilter);
  }

  /**
   * Handles changing selected product
   */
  private onChangeProduct = async (e: any, { value }: DropdownProps) => {
    const { products } = this.props;
    if (!products) {
      return;
    }
    let productName = "";

    const product = products.find(product => product.id === value);
    if (product) {
      productName = LocalizedUtils.getLocalizedValue(product.name) || "";
    }

    this.setState({
      selectedProductName: productName
    });

    await this.updatePackingsList(value as string, this.state.createdBeforeFilter, this.state.createdAfterFilter);

  }

  private renderListItems = () => {
    return this.state.listItems.map((item, i) => {
      return (
        <List.Item style={ i % 2 == 0 ? { backgroundColor: "#ddd" } : {} } key={ i }>
          <List.Content floated='right'>
            <NavLink to={ `/cutPackings/${item.id}` }>
              <Button className="submit-button">{ strings.open }</Button>
            </NavLink>
          </List.Content>
          <List.Content>
            <List.Header style={{ paddingTop: "10px" }}>
              { item.name }
            </List.Header>
          </List.Content>
        </List.Item>
      );
    });
  }

  /**
   * Gets the list items
   * 
   * @param cutPackings packings to render
   * @param products products to get the names from
   */
  private getListItems = (cutPackings: CutPacking[], products: Product[]): PackingListItem[] => {
    return cutPackings.map(packing => {
      const product = products.find(product => product.id === packing.productId);
      const productName = product ? LocalizedUtils.getLocalizedValue(product.name) : packing.productId;

      return { name: this.getPackingName(productName, moment(packing.cuttingDay).format("DD.MM.YYYY")), id: packing.id! };
    });
  }

  /**
   * Gets a display name for a packing name
   * 
   * @param productName the name of a product
   * @param cuttingDay the day on which a packing was cut
   */
  private getPackingName = (productName: string, cuttingDay: string): string => {
    return `${ productName } - ${ strings.cut } ${ cuttingDay }`
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
    onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error)),
    onProductsFound: (products: Product[]) => dispatch(actions.productsFound(products))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CutPackingsList);
