import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Campaign, PackageSize, Packing, PackingState, Product, StorageDiscard } from "../generated/client";
import strings from "src/localization/strings";
import * as moment from "moment";
import * as actions from "../actions";
import { StoreState, ErrorMessage } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  Button,
  Grid,
  Loader,
  Form,
  InputOnChangeData,
  TextAreaProps,
  Table,
  Visibility,
  Transition
} from "semantic-ui-react";
import { DateInput } from 'semantic-ui-calendar-react';
import LocalizedUtils from "src/localization/localizedutils";
import { keysIn } from "lodash";
import { Profiler } from "inspector";


/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  onError: (error: ErrorMessage) => void;
}

/**
 * Interface representing component state
 */
interface State {
  filters: Filters;
  loading: boolean;
  allFound: boolean;
  discardedProducts: StorageDiscard[];
  products: Product[];
  packageSizes?: PackageSize[];
}

/**
 * Interface describing filters
 */
 interface Filters {
  firstResult: number;
  productId: string;
  packingState?: PackingState;
  dateBefore?: string;
  dateAfter?: string;
}

/**
 * React component for displaying list of discarded products
 */
class DiscardList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      products: [],
      allFound: false,
      loading: false,
      filters: {
        firstResult: 0,
        productId: "all-products"
      },
      discardedProducts: []
    };
  }

  /**
   * Component did mount life cycle event
   */
   public async componentDidMount() {
    try {
      await this.fetchData(this.state.filters, false);
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }
   
  /**
   * Render 
   */
  public render = () => {
    const { filters, discardedProducts, products, loading } = this.state;

    const possibleLoader = (): any=> {
      if (loading) {
        return <Loader 
          style={{ marginLeft: "auto", marginRight: "auto" }}
          inline
          active
          size="medium" />
      }
    }

    const discardedTableRows = (discardedProducts || []).map(this.renderDiscardRow);

    const filterStyles: React.CSSProperties = {
      display:"inline-block",
      paddingTop: "2rem",
      paddingBottom: "2rem",
      paddingRight: "2rem"
    };

    return (
      <Grid>
        <Grid.Row
          className="content-page-header-row"
          style={{
            flex: 1,
            justifyContent: "space-between",
            paddingLeft: 10,
            paddingRight: 10
          }}
        >
          <h2>{ strings.discards }</h2>
          <NavLink to="/createDiscard">
            <Button className="submit-button">
              { strings.newDiscard }
            </Button>
          </NavLink>
        </Grid.Row>
        <Grid.Row>
          <Form>
            <Form.Field>
              <div style={ filterStyles }>
                <label>{ strings.dateBefore }</label>
                <DateInput
                  dateFormat="DD.MM.YYYY"
                  onChange={ this.onChangeDateBefore }
                  name="dateBefore"
                  value={ filters.dateBefore ? moment(filters.dateBefore).format("DD.MM.YYYY") : "" }
                />
              </div>
              <div style={ filterStyles }>
                <label>{ strings.dateAfter }</label>
                <DateInput
                  dateFormat="DD.MM.YYYY"
                  onChange={ this.onChangeDateAfter }
                  name="dateAfter"
                  value={ filters.dateAfter ? moment(filters.dateAfter).format("DD.MM.YYYY") : "" }
                />
              </div>
              <div style={ filterStyles }>
                <label>{ strings.productName }</label>
                <Form.Select
                  name="product"
                  options={ this.renderOptions() }
                  onChange={ this.onChangeProduct }
                  value={ filters.productId || "" }
                />
              </div>
            </Form.Field>
          </Form>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Visibility onUpdate={ this.loadMore }>
              <Table selectable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>{ strings.product }</Table.HeaderCell>
                    <Table.HeaderCell>{ strings.discardDate }</Table.HeaderCell>
                    <Table.HeaderCell>{ strings.packingTableHeaderBoxes }</Table.HeaderCell>
                    <Table.HeaderCell>{ strings.packingTableHeaderPackageSize }</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                    <Table.Body>
                    { discardedTableRows }
                  </Table.Body>
                </Table>
            </Visibility>
          </Grid.Column>
        </Grid.Row>
        { possibleLoader() }
      </Grid>
    );
  }

  /**
   * method for loading more discarded products 
   */
  private loadMore = async (e: any, { calculations }: any) => {
    const { filters, loading, allFound } = this.state;
    if (calculations.bottomVisible === true && !loading && !allFound) {
      const firstResult = ((filters || {}).firstResult || 0) + 20;
      await this.fetchData({ ...filters, firstResult }, true);
    }
  }

  /**
   * method for rendering table row
   * 
   * @param discardedProduct discarded product to render
   */
  private renderDiscardRow = (discardedProduct: StorageDiscard) => {
    const { packageSizes } = this.state;

    const packageSize = discardedProduct.packageSizeId ? (packageSizes || []).find(p => p.id === discardedProduct.packageSizeId) : null;
    const packageSizeName = packageSize ? LocalizedUtils.getLocalizedValue(packageSize.name) : "";
    const name = this.getProductName(discardedProduct);
    const discardDAte = moment(discardedProduct.discardDate).format("DD.MM.YYYY");
    const amount = discardedProduct.discardAmount;

    return (
      <Table.Row key={ discardedProduct.id }>
        <Table.Cell>{ name }</Table.Cell>
        <Table.Cell>{ discardDAte }</Table.Cell>
        <Table.Cell>{ amount }</Table.Cell>
        <Table.Cell>{ packageSizeName }</Table.Cell>
        <Table.Cell textAlign='right'>
          <NavLink to={ `/discards/${discardedProduct.id}` }>
              <Button className="submit-button">{strings.edit}</Button>
          </NavLink>
        </Table.Cell>
      </Table.Row>
    )
  }



   /**
   * Returns a products name
   * 
   * @param discardedProduct discarded product 
   */
    private getProductName = (discardedProduct: StorageDiscard): string => {
      const { products, discardedProducts } = this.state;
      const discard = (products || []).find(product => product.id == discardedProduct.productId);

      const productName = discard ? LocalizedUtils.getLocalizedValue(discard.name) : "";

      return productName;
    }
  

  /**
   * Method for fetching discarded products
   */
  private fetchData = async (filters: Filters, append: boolean) => {
    const { keycloak } = this.props;
    const { productId, dateAfter, dateBefore, firstResult } = filters;
    const { discardedProducts } = this.state;

    if(!keycloak) {
      return;
    }

    this.setState({
      loading: true
    })

    const productsService = await Api.getProductsService(keycloak)
    const products = await productsService.listProducts({ includeSubcontractorProducts: true })

    const packageSizesService = await Api.getPackageSizesService(keycloak);
    const packageSizes = await packageSizesService.listPackageSizes({})

    const storageDiscardService  = await Api.getStorageDiscardsService(keycloak);

    const fr = append ? firstResult : 0;
    const discards = await storageDiscardService.listStorageDiscards({ 
      productId: productId !== "all-products" ? productId : undefined,
      toTime: dateBefore,
      fromTime: dateAfter,
      maxResults: 20,
      firstResult: fr
    });
    
    if(append) {
      this.setState({
        discardedProducts: [...discardedProducts, ...discards],
        loading: false
      })
    } else {
      this.setState({
        discardedProducts: discards,
        products,
        packageSizes,
        loading: false
      })
    }

    this.setState({ filters: {...filters, firstResult: fr}, loading: false, allFound: discards.length < 20 });

  }

  /**
   * Handles changing date
   *
   * @param e event
   * @param value value from InputOnChangeData
   */
     private onChangeDateAfter = async (e: any, { value }: InputOnChangeData) => {
      const updatedFilters: Filters = {
        ...this.state.filters,
        dateAfter: moment(value, "DD.MM.YYYY").toISOString()
      };
  
      this.setState({ filters: updatedFilters });

      await this.fetchData(updatedFilters, false).catch(err => {
        this.props.onError({
          message: strings.defaultApiErrorMessage,
          title: strings.defaultApiErrorTitle,
          exception: err
        });
      });
    }
  
    /**
     * Handles changing date
     *
     * @param e event
     * @param value value from InputOnChangeData
     */
    private onChangeDateBefore = async (e: any, { value }: InputOnChangeData) => {
      const updatedFilters: Filters = {
        ...this.state.filters,
        dateBefore: moment(value, "DD.MM.YYYY").toISOString()
      };
      this.setState({ filters: updatedFilters });
  
      await this.fetchData(updatedFilters, false).catch(err => {
        this.props.onError({
          message: strings.defaultApiErrorMessage,
          title: strings.defaultApiErrorTitle,
          exception: err
        });
      });
    }

  /**
   * Handles changing selected product
   *
   * @param e event
   * @param value value from event data
   */
  private onChangeProduct = async (e: any, { value }: InputOnChangeData | TextAreaProps) => {
    const { products } = this.state;

    if (!products) {
      return;
    }

    const updatedFilters: Filters = {
      ...this.state.filters,
      productId: value ? `${value}` : "all-products"
    };

    this.setState({ filters: updatedFilters });

    await this.fetchData(updatedFilters, false).catch((err) => {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: err
      });
    });
  }

  /**
   * Renders dropdown options
   */
     private renderOptions = () => {
      const { products } = this.state;
  
      const options = [{ text: strings.allProducts, value: "all-products" }];
  
      if (products) {
        options.push(
          ...products.map(({ name, id }) => ({
            text: LocalizedUtils.getLocalizedValue(name) || "",
            value: id || ""
          }))
        );
      }
  
      return options;
    }
}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
const mapStateToProps = (state: StoreState) => ({

});

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
const mapDispatchToProps = (dispatch: Dispatch<actions.AppAction>) => ({
  onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DiscardList);
