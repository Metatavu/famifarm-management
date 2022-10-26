import Api  from "../api";
import * as React from "react";
import { StoreState } from "../types";
import { Dispatch } from "redux";
import * as actions from "../actions";
import { connect } from "react-redux";
import { Campaign, PackageSize, Packing, PackingState, PackingType, Product } from "../generated/client";
import LocalizedUtils from "../localization/localizedutils";
import { Accordion, Button, Grid, Icon, Loader, Table } from "semantic-ui-react";
import strings from "../localization/strings";
import AnimateHeight from "react-animate-height";
import { DateTimeInput } from 'semantic-ui-calendar-react';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';
import "moment/locale/fi";
import "moment/locale/en-gb";

/**
 * Moment extended with moment-range
 */
const moment = extendMoment(Moment);

/**
 * Interface describing component props
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
}

/**
 * Interface describing component state
 */
interface State {
  productListItems: BasicPackingProduct[];
  campaignListItems: StoreListItem[];
  loading: boolean;
  products: Product[];
  packings: Packing[];
  packingSizes: PackageSize[];
  openIndexes: number[];
  selectedDate: Date;
}

/**
 * Interface describing basic packing date data
 */
interface BasicPackingDateData {
  header: string;
  value: number;
}

/**
 * Interface describing basic packing product data
 */
interface BasicPackingProductData {
  packageSize: PackageSize,
  total: number,
  dates: BasicPackingDateData[]
}

/**
 * Interface describing basic packing product
 */
interface BasicPackingProduct {
  product: Product,
  data: BasicPackingProductData[]
}

/**
 * Interface describing store list item
 */
interface StoreListItem {
  name: string;
  amountInStore: number;
  oldestDate?: string;
  packingSizeAmounts?: number[];
}

/**
 * View store component
 */
class ViewStore extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      productListItems: [],
      campaignListItems: [],
      loading: true,
      products: [],
      packings: [],
      packingSizes: [],
      openIndexes: [],
      selectedDate: new Date()
    };

    moment.locale(strings.getLanguage() === "fi" ? "fi" : "en-gb");
  }

  /**
   * Component did mount life cycle method
   */
  public componentDidMount = async () => {
    const data = await this.fetchData();
    if (!data) {
      this.setState({ loading: false });
      return;
    }

    const { products, packings, packingSizes, campaigns } = data;
    const sortedPackingSizes = packingSizes.sort((p, p1) => (p.size || 0) - (p1.size || 0));
    const basicPackings = packings.filter(p => p.type === PackingType.Basic);
    const dates = this.getTableDates(basicPackings);
    const productListItems = this.constructBasicPackingProducts(products, basicPackings, sortedPackingSizes, dates);
    const campaignListItems = this.constructCampaignListItems(campaigns, packings);

    this.setState({
      productListItems,
      campaignListItems,
      products,
      packings,
      packingSizes,
      loading: false
    });
  }

  /**
   * Component did update life cycle method
   *
   * @param prevProps previous component properties
   * @param prevState previous component state
   */
  public componentDidUpdate = (prevProps: Props, prevState: State) => {
    const { selectedDate } = this.state;
    if (prevState.selectedDate.getTime() !== selectedDate.getTime()) {
      const { products, packings, packingSizes } = this.state;

      const basicPackings = packings
        .filter(packing => packing.type === PackingType.Basic)
        .filter(packing => moment(packing.time).isBefore(selectedDate));

      const dates = this.getTableDates(basicPackings);
      const productListItems = this.constructBasicPackingProducts(products, basicPackings, packingSizes, dates);

      this.setState({ productListItems });
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const {
      loading,
      productListItems,
      campaignListItems,
      selectedDate
    } = this.state;

    if (loading) {
      return (
        <Grid style={{ paddingTop: "100px" }} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    const basicProducts = productListItems.filter(basicProduct => basicProduct.data.length);
    const basicProductListItems = basicProducts.map(this.renderProductListItem);

    return (
      <Grid>
        <Grid.Row
          className="content-page-header-row"
          style={{ flex: 1,justifyContent: "space-between", alignItems: "center", paddingLeft: 10, paddingRight: 10 }}
        >
          <h2 style={{ marginBottom: 0 }}>{ strings.store }</h2>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: 10 }}>
              { strings.filterByDate }
            </span>
            <div style={{ marginRight: 10 }}>
              <DateTimeInput
                closable
                closeOnMouseLeave={ false }
                preserveViewMode={ false }
                maxDate={ moment().endOf("day").toDate() }
                onChange={ this.onSelectDate }
                value={ moment(selectedDate).format("DD.MM.YYYY HH.mm") }
              />
            </div>
            <Button
              onClick={ this.openAll }
              style={{ backgroundColor: "#2AA255", color: "white", padding: "12px 30px", marginRight: 10 }}
            >
              { strings.openAll }
            </Button>
            <Button
              onClick={ this.closeAll }
              style={{ backgroundColor: "#2AA255", color: "white", padding: "12px 30px" }}
            >
              { strings.closeAll }
            </Button>
          </div>
        </Grid.Row>  
        <Grid.Row>
          <Grid.Column style={{ overflowX: "auto" }}>
            { basicProductListItems }
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>{ strings.campaignName }</Table.HeaderCell>
                  <Table.HeaderCell>{ strings.amountInStore }</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>{ this.renderStoreTable(campaignListItems) }</Table.Body>
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  /**
   * Renders store table
   *
   * @param storeListItem store list item
   */
  private renderStoreTable = (storeListItems: StoreListItem[]) => {
    return storeListItems.map((item, i) => {
      const packingSizeAmountCells = (item.packingSizeAmounts || []).map(packingSizeAmount =>
        <Table.Cell>{ packingSizeAmount }</Table.Cell>
      );

      return (
        <Table.Row
          key={ i }
          style={{ backgroundColor: i % 2 == 0 ? "#ddd" : "initial" }}
        >
          <Table.Cell>{ item.name }</Table.Cell>
          <Table.Cell>{ item.amountInStore }</Table.Cell>
          { item.oldestDate &&
            <Table.Cell>{ item.oldestDate }</Table.Cell>
          }
          { packingSizeAmountCells }
        </Table.Row>
      );
    });
  }

  /**
   * Renders product list item
   *
   * @param productData product data
   * @param index index of list item
   */
  private renderProductListItem = (productData: BasicPackingProduct, index: number) => {
    const isOpen = this.isOpen(index);
    return (
      <Accordion
        key={ index }
        fluid
        styled
        activeIndex={ isOpen ? 1 : undefined }
        onTitleClick={ this.toggleOpen(index) }
        style={{ marginBottom: 10, borderRadius: 0, boxShadow: "none", backgroundColor: "#2AA25555" }}
        panels={[{
          key: 1,
          title: this.renderListItemTitle(productData, isOpen),
          content: this.renderListItemContent(productData, isOpen)
        }]}
      />
    );
  }

  /**
   * Renders list item title
   *
   * @param productData product data
   * @param isOpen is product open
   */
  private renderListItemTitle = (productData: BasicPackingProduct, isOpen: boolean) => {
    return (
      <Accordion.Title
        active={ isOpen }
        style={{ color: "black" }}
      >
        <Icon name={ isOpen ? "caret up" : "caret down" }/>
        { LocalizedUtils.getLocalizedValue(productData.product.name) }
      </Accordion.Title>
    );
  }

  /**
   * Renders list item content
   *
   * @param productData product data
   * @param isOpen is product open
   */
  private renderListItemContent = (productData: BasicPackingProduct, isOpen: boolean) => {
    return (
      <AnimateHeight
        animateOpacity
        duration={ 250 }
        height={ isOpen ? 'auto' : 0 }
      >
        <div style={{ overflowX: "auto" }}>
          <Table
            key={ productData.product.id }
            style={{ borderRadius: 0, border: "none" }}
          >
            <Table.Header>
              { this.renderListItemTableHeader(productData) }
            </Table.Header>
            <Table.Body>
              { this.renderListItemTableBody(productData) }
            </Table.Body>
          </Table>
        </div>
      </AnimateHeight>
    );
  }

  /**
   * Renders list item table header
   *
   * @param productData product data
   */
  private renderListItemTableHeader = (productData: BasicPackingProduct) => {
    return (
      <Table.Row>
        <Table.HeaderCell style={{ paddingLeft: 30 }}>
          { strings.packageSize }
        </Table.HeaderCell>
        { productData.data[0].dates.map(({ header }) =>
          <Table.HeaderCell key={ header }>
            { header }
          </Table.HeaderCell>
        )}
        <Table.HeaderCell>
          { strings.total }
        </Table.HeaderCell>
      </Table.Row>
    );
  }

  /**
   * Renders list item table body
   *
   * @param productData product data
   */
  private renderListItemTableBody = (productData: BasicPackingProduct) => {
    return productData.data.map(productRowData =>
      <Table.Row key={ productRowData.packageSize.id }>
        <Table.Cell style={{ paddingLeft: 30 }}>
          { LocalizedUtils.getLocalizedValue(productRowData.packageSize.name) }
        </Table.Cell>
        { productRowData.dates.map(({ header, value }) => 
          <Table.Cell key={ header }>
            { value }
          </Table.Cell>
        )}
        <Table.Cell>
          { productRowData.total }
        </Table.Cell>
      </Table.Row>
    );
  }

  /**
   * Fetch data needed by component from API
   */
  private fetchData = async () => {
    const { keycloak } = this.props;

    if (!keycloak) {
      return;
    }

    const [ productsApi, packingSizesApi, packingsApi, campaignsApi ] = await Promise.all([
      Api.getProductsService(keycloak),
      Api.getPackageSizesService(keycloak),
      Api.getPackingsService(keycloak),
      Api.getCampaignsService(keycloak)
    ]);

    const [ products, packings, packingSizes, campaigns ] = await Promise.all([
      productsApi.listProducts({}),
      packingsApi.listPackings({ status: PackingState.InStore }),
      packingSizesApi.listPackageSizes({}),
      campaignsApi.listCampaigns()
    ]);

    return { products, packings, packingSizes, campaigns };
  }

  /**
   * Constructs basic packing products from given products, packings and package sizes
   *
   * @param products products
   * @param packings packings
   * @param packageSizes package sizes
   * @param dates array of moment dates
   * @returns list of basic packing products
   */
  private constructBasicPackingProducts = (
    products: Product[],
    packings: Packing[],
    packageSizes: PackageSize[],
    dates: Moment.Moment[]
  ): BasicPackingProduct[] => {
    return products.map(product => {
      const productPackings = packings.filter(packing => packing.productId === product.id);
      const productPackageSizes = this.getProductPackageSizes(packageSizes, product);
      const packingSizeData = productPackageSizes.map(packageSize => {
        const packingsSizePackingProducts = productPackings.filter(packing => packing.packageSizeId === packageSize.id);
          const totalSum = packingsSizePackingProducts
            .map(p => p.packedCount || 0)
            .reduce((a: number, b: number )=> a + b, 0);
          const dateSums = dates.map(date => {
            const datePackings = packingsSizePackingProducts.filter(p => moment(p.time).isSame(date, "day"));
            const dateAmount = datePackings
              .map(p => p.packedCount || 0)
              .reduce((a: number, b: number )=> a + b, 0);
            return { header: date.format("DD.MM.YYYY"), value: dateAmount };
          });
          return { packageSize: packageSize, total: totalSum, dates: dateSums };
      })
      return { product: product, data: packingSizeData };
    });
  }

  /**
   * Constructs campaign list items from given campaigns and packings
   *
   * @param campaigns campaigns
   * @param packings packings
   * @returns list of store list items
   */
  private constructCampaignListItems = (campaigns: Campaign[], packings: Packing[]): StoreListItem[] => {
    const packingsInStoreByCampaign = campaigns
      .map(campaign => packings.filter(packing => packing.campaignId === campaign.id))
      .filter(packings => packings.length > 0);

    return packingsInStoreByCampaign.map(packings => {
      const amountInStore = packings.length;
      const campaignId = packings[0].campaignId;
      const name = campaigns.find(campaign => campaign.id == campaignId)!!.name;

      return { amountInStore, name };
    });
  }

  /**
   * Filter package sizes by default package sizes of product
   *
   * @param packageSizes list of package sizes
   * @param product product
   */
  private getProductPackageSizes = (packageSizes: PackageSize[], product: Product) => {
    return packageSizes.filter(packageSize => {
      const { defaultPackageSizeIds } = product;
      return defaultPackageSizeIds ?
        defaultPackageSizeIds.some(id => id === packageSize.id) :
        false;
    });
  }

  /**
   * Gets dates for basic packages table
   *
   * @param packings list of packings to get dates from
   * @returns array of moment dates
   */
  private getTableDates = (packings: Packing[]): Moment.Moment[] => {
    if (!packings.length) {
      return [];
    }

    const min = moment.min(packings.map(p => moment(p.time))).startOf("day");
    const max = moment.max(packings.map(p => moment(p.time))).endOf("day");
    return Array.from(moment.range(min, max).by("day")).reverse();
  }

  /**
   * Toggles product accordion open
   *
   * @param index product index
   */
  private toggleOpen = (index: number) => () => {
    const {  openIndexes } = this.state;
    this.setState({
      openIndexes: openIndexes.find(openIndex => openIndex === index) !== undefined ?
        openIndexes.filter(openIndex => openIndex !== index) :
        [ ...openIndexes, index ]
    })
  }

  /**
   * Opens all products
   */
  private openAll = () => {
    this.setState({
      openIndexes: this.state.productListItems.map((item, index) => index)
    });
  }

  /**
   * Closes all products
   */
  private closeAll = () => {
    this.setState({ openIndexes: [] });
  }

  /**
   * Is product accordion open
   *
   * @param index index of product in products list
   */
  private isOpen = (index: number) => {
    return this.state.openIndexes.find(openIndex => openIndex === index) !== undefined;
  }

  /**
   * Event handler for select date
   *
   * @param e React change event
   * @param updatedData updated data from DateTimeInput
   */
  private onSelectDate = async (e: React.SyntheticEvent<HTMLElement>, updatedData: { name: string, value: string }) => {
    if (!updatedData || !updatedData.value) {
      return;
    }

    this.setState({
      selectedDate: moment(updatedData.value, "DD.MM.YYYY HH.mm").toDate()
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
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewStore);