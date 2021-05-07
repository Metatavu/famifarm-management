import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Campaign, PackageSize, Packing, PackingState, Product } from "../generated/client";
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


/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  packings?: Packing[];
  products?: Product[];
  packageSizes?: PackageSize[];
  campaigns?: Campaign[];
  location?: any;
  onPackingsFound?: (packings: Packing[]) => void;
  onProductsFound?: (products: Product[]) => void;
  onCampaignsFound?: (campaigns: Campaign[]) => void;
  onPackageSizesFound?: (packageSizes: PackageSize[]) => void;
  onError: (error: ErrorMessage) => void;
}

/**
 * Interface representing component state
 */
interface State {
  packings: Packing[];
  filters: Filters;
  loading: boolean;
  errorCount: number;
  allFound: boolean;
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
 * React component for displaying list of packings
 */
class PackingList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      packings: [],
      loading: false,
      allFound: false,
      errorCount: 0,
      filters: {
        firstResult: 0,
        productId: "all-products"
      }
    };
  }

  /**
   * Component did mount life cycle event
   */
  public async componentDidMount() {
    try {
      await this.updatePackings(this.state.filters, false);
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Returns a text for a basic packing list entry
   * 
   * @param packing packing 
   */
  private getPackingName = (packing: Packing): string => {
    const { products } = this.props;
    const packingProduct = (products || []).find(product => product.id === packing.productId);
    const productName = packingProduct ?
      LocalizedUtils.getLocalizedValue(packingProduct.name) :
      packing.id;
    const packingDate = moment(packing.time).format("DD.MM.YYYY");

    return `${productName} - ${packingDate}`;
  }

    /**
   * Returns a text for a campaign packing list entry
   * 
   * @param packing packing
   */
  private getCampaignPackingName = (packing: Packing): string => {
    const { campaigns } = this.props;
    const packingCampaign = (campaigns || []).find(campaign => campaign.id === packing.campaignId);
    const campaignName = packingCampaign ? packingCampaign.name : packing.id;
    const packingDate = moment(packing.time).format("DD.MM.YYYY");
    
    return `${campaignName} - ${packingDate}`;
  }

  /**
   * Render packing list view
   */
  public render() {
    const { packings } = this.props;
    const { filters } = this.state;

    const possibleLoader = (): any => {
      if (this.state.loading) {
        return <Loader 
          style={{ marginLeft: "auto", marginRight: "auto" }}
          inline
          active
          size="medium" />
      }
    }

    const packingTableRows = (packings || []).map(packing => this.renderPackingTableRow(packing));
    const totalBoxes = (packings || []).reduce((a, b) => a + (this.getAmountOfBoxes(b) || 0), 0);

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
          style={{ flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10 }}
        >
          <h2>{ strings.packings }</h2>
          <NavLink to="/createPacking">
            <Button className="submit-button">{ strings.newPacking }</Button>
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
              <div style={{ ...filterStyles, paddingRight: 0 }}>
                <label>{ strings.packingStatus }</label>
                <Form.Select
                  name="status"
                  options={
                    [{ value: "all-status", text: strings.allPackingStates }].concat(
                    Object.keys(PackingState).map(state => ({
                      value: PackingState[state], text: this.resolveLocalizedPackingState(PackingState[state])
                    })))
                  }
                  value={ filters.packingState || "all-status" }
                  onChange={ this.onChangeState }
                />
              </div>
            </Form.Field>
          </Form>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Visibility onUpdate={this.loadMore}>
              <Table selectable>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>{ strings.packingTableHeaderName }</Table.HeaderCell>
                    <Table.HeaderCell>{ strings.packingTableHeaderStatus }</Table.HeaderCell>
                    <Table.HeaderCell>{ strings.packingTableHeaderDate }</Table.HeaderCell>
                    <Table.HeaderCell>{ strings.packingTableHeaderBoxes }</Table.HeaderCell>
                    <Table.HeaderCell>{ strings.packingTableHeaderPackageSize }</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  { packingTableRows }
                </Table.Body>
                <Table.Footer fullWidth>
                  <Table.Row>
                    <Table.HeaderCell colSpan='7'>
                      <Transition visible={this.state.allFound} animation="fly right" >
                        <b>{ strings.formatString(strings.totalPackingsRow, totalBoxes) }</b>
                      </Transition>
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Footer>
              </Table>
              </Visibility>
          </Grid.Column>
        </Grid.Row>
        {possibleLoader()}
      </Grid>
    );
  }

  private loadMore = async (e: any, { calculations }: any) => {
    const { filters, loading, allFound } = this.state;
    if (calculations.bottomVisible === true && !loading && !allFound) {
      const firstResult = ((filters || {}).firstResult || 0) + 20;
      await this.updatePackings({...filters, firstResult}, true);
    }
  }
  
  private getAmountOfBoxes = (packing: Packing) => {
    if (packing.type == "BASIC") {
      return packing.packedCount;
    }

    return 0;
  }

  private renderPackingTableRow = (packing: Packing) => {
    const name = packing.type == "BASIC" ? 
      this.getPackingName(packing) :
      this.getCampaignPackingName(packing);

    const packageSize = packing.packageSizeId ? (this.props.packageSizes || []).find(p => p.id === packing.packageSizeId) : null;
    const packageSizeName = packageSize ? LocalizedUtils.getLocalizedValue(packageSize.name) : "";
    const status = this.resolveLocalizedPackingState(packing.state);
    const packingDate = moment(packing.time).format("DD.MM.YYYY");
    const amount = packing.type == "BASIC" ? this.getAmountOfBoxes(packing) : "-";

    return (
      <Table.Row key={packing.id}>
        <Table.Cell>{ name }</Table.Cell>
        <Table.Cell>{ status }</Table.Cell>
        <Table.Cell>{ packingDate }</Table.Cell>
        <Table.Cell>{ amount }</Table.Cell>
        <Table.Cell>{ packageSizeName }</Table.Cell>
        <Table.Cell textAlign='right'>
          <NavLink to={ `/packings/${packing.id}` }>
              <Button className="submit-button">{strings.open}</Button>
          </NavLink>
        </Table.Cell>
      </Table.Row>
    )
  }

  /**
   * Returns a localized name for packing state
   * 
   * @param state packing state
   */
  private resolveLocalizedPackingState = (state: string): string => {
    switch (state as PackingState) {
      case PackingState.InStore: return strings.packingStoreStatus;
      case PackingState.Removed: return strings.packingRemovedStatus;
      case PackingState.Wastage: return strings.packingWastageStatus;
      default: return strings.selectPackingStatus;
    }
  }

  /**
   * Handles changing packing state
   *
   * @param e event
   * @param value value from InputOnChangeData
   */
  private onChangeState = async (e: any, { value }: InputOnChangeData) => {
    const updatedFilters: Filters = {
      ...this.state.filters,
      packingState: value && value != "all-status" ? value as PackingState : undefined
    };

    this.setState({ filters: updatedFilters });

    await this.updatePackings(updatedFilters, false).catch(err => {
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
  private onChangeDateAfter = async (e: any, { value }: InputOnChangeData) => {
    const updatedFilters: Filters = {
      ...this.state.filters,
      dateAfter: moment(value, "DD.MM.YYYY").toISOString()
    };

    this.setState({ filters: updatedFilters });

    await this.updatePackings(updatedFilters, false).catch(err => {
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

    await this.updatePackings(updatedFilters, false).catch((err) => {
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
    const { products } = this.props;

    if (!products) {
      return;
    }

    const updatedFilters: Filters = {
      ...this.state.filters,
      productId: value ? `${value}` : "all-products"
    };

    this.setState({ filters: updatedFilters });

    await this.updatePackings(updatedFilters, false).catch((err) => {
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
    const { products } = this.props;

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

  /**
   * Updates packings list
   *
   * @param filters filters
   */
  private updatePackings = async (filters: Filters, append: boolean) => {
    const { keycloak, onPackingsFound, onProductsFound, onCampaignsFound, onPackageSizesFound } = this.props;
    const { productId, packingState, dateAfter, dateBefore, firstResult } = filters;
    if (!keycloak) {
      return;
    }

    this.setState({ loading: true });
    const [ packingsService, productsService, campaignsService, packageSizesService ] = await Promise.all([
      Api.getPackingsService(keycloak),
      Api.getProductsService(keycloak),
      Api.getCampaignsService(keycloak),
      Api.getPackageSizesService(keycloak)
    ]);

    if (!this.props.packageSizes || this.props.packageSizes.length < 1) {
      const packageSizes = await packageSizesService.listPackageSizes({ });
      onPackageSizesFound && onPackageSizesFound(packageSizes);
    }

    if (!this.props.products || this.props.products.length < 1) {
      const products = await productsService.listProducts({ })
      onProductsFound && onProductsFound(products);
    }
    if (!this.props.campaigns || this.props.campaigns.length < 1) {
      const campaigns = await campaignsService.listCampaigns();
      onCampaignsFound && onCampaignsFound(campaigns);
    }
    const fr = append ? firstResult : 0;
    const packings  = await packingsService.listPackings({
      productId: productId !== "all-products" ? productId : undefined,
      status: packingState,
      createdAfter: dateAfter,
      createdBefore: dateBefore,
      firstResult: fr,
      maxResults: 20
    });
    onPackingsFound && onPackingsFound(append ? (this.props.packings || []).concat(packings) : packings);
    this.setState({ filters: {...filters, firstResult: fr}, loading: false, allFound: packings.length < 20 });
  }
}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
const mapStateToProps = (state: StoreState) => ({
  products: state.products,
  packings: state.packings,
  campaigns: state.campaigns,
  packageSizes: state.packageSizes
});

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
const mapDispatchToProps = (dispatch: Dispatch<actions.AppAction>) => ({
  onProductsFound: (products: Product[]) => dispatch(actions.productsFound(products)),
  onPackingsFound: (packings: Packing[]) => dispatch(actions.packingsFound(packings)),
  onCampaignsFound: (campaigns: Campaign[]) => dispatch(actions.campaignsFound(campaigns)),
  onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error)),
  onPackageSizesFound: (packageSizes: PackageSize[]) => dispatch(actions.packageSizesFound(packageSizes))
});

export default connect(mapStateToProps, mapDispatchToProps)(PackingList);
