import Api  from "src/api";
import * as React from "react";
import { StoreState } from "src/types";
import { Dispatch } from "redux";
import * as actions from "../actions";
import { connect } from "react-redux";
import { PackageSize, Packing, PackingState, PackingType, Product } from "../generated/client";
import LocalizedUtils from "src/localization/localizedutils";
import { Grid, Loader, Table } from "semantic-ui-react";
import strings from "src/localization/strings";
import * as moment from "moment";

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
  productListItems: BasicPackingProduct[],
  campaignListItems: StoreListItem[],
  loading: boolean,
  packingSizes: PackageSize[]
}

interface BasicPackingDateData {
  header: string,
  value: number
}

interface BasicPackingProductData {
  packageSize: PackageSize,
  total: number,
  dates: BasicPackingDateData[]
}

interface BasicPackingProduct {
  product: Product,
  data: BasicPackingProductData[]
}

interface StoreListItem {
  name: string;
  amountInStore: number;
  oldestDate?: string;
  packingSizeAmounts?: number[];
}

class ViewStore extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      productListItems: [],
      campaignListItems: [],
      loading: false,
      packingSizes: []
    };
  }

  public componentDidMount = async () => {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({ loading: true });

    const { keycloak } = this.props;

    const [productsApi, packingSizesApi, packingsApi, campaignsApi] = await Promise.all([Api.getProductsService(keycloak), Api.getPackageSizesService(keycloak), Api.getPackingsService(keycloak), Api.getCampaignsService(keycloak)]);
    let [products, packingSizes, campaigns]= await Promise.all([productsApi.listProducts({}), packingSizesApi.listPackageSizes({}), campaignsApi.listCampaigns()]);

    const packings = await packingsApi.listPackings({status: PackingState.InStore});
    const basicPackings = packings.filter(p => p.type == PackingType.Basic);
    const maxDate = moment.max(basicPackings.map(p => moment(p.time))).endOf("day");
    const minDate = moment.min(basicPackings.map(p => moment(p.time))).startOf("day");
    let dates: moment.Moment[] = [];
    for (let date = minDate; date.isBefore(maxDate); date.add(1, "day")) {
      dates = [date.clone()].concat(dates);
    }
    packingSizes = packingSizes.sort((p, p1) => (p.size || 0) - (p1.size || 0));
    let productListItems: BasicPackingProduct[] = products.map(product => {
      let productPackings = basicPackings.filter(packing => packing.productId == product.id);
      let packingSizeData = packingSizes.map((packingSize) => {
        let packingsSizePackingProducts = productPackings.filter(packing => packing.packageSizeId == packingSize.id);
          let totalSum = packingsSizePackingProducts.map(p => p.packedCount || 0).reduce((a: number, b: number )=> a + b, 0); 
          let dateSums = dates.map((date) => {
            let datePackings = packingsSizePackingProducts.filter((p) => moment(p.time).isSame(date, "day"));
            let dateAmount = datePackings.map(p => p.packedCount || 0).reduce((a: number, b: number )=> a + b, 0);
            return { header: date.format("DD.MM.YYYY"), value: dateAmount };
          });
          return { packageSize: packingSize, total: totalSum, dates: dateSums }
      })
      return { product: product, data: packingSizeData };
    });

    let packingsInStoreByCampaign = campaigns.map(campaign => {
      return packings.filter(packing => packing.campaignId === campaign.id);
    })

    packingsInStoreByCampaign = packingsInStoreByCampaign.filter(packings => packings.length > 0);

    const campaignListItems = packingsInStoreByCampaign.map(packings => {
      const amountInStore = packings.length;
      const campaignId = packings[0].campaignId;
      const name = campaigns.find(campaign => campaign.id == campaignId)!!.name;

      return { amountInStore, name };
    });

    this.setState({ productListItems, campaignListItems, packingSizes, loading: false });
  }

  public render = () => {
    if (this.state.loading) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    const basicData = this.state.productListItems;

    const packingSizeNames = this.state.packingSizes.map(packingSize => {
      return (
        <Table.HeaderCell>{ LocalizedUtils.getLocalizedValue(packingSize.name) }</Table.HeaderCell>
      );
    })

    const basicItems = [];
    for (let i = 0; i < basicData.length; i++) {
      let productData = basicData[i];
      if (!productData.data.length) {
        continue;
      }
      basicItems.push(
        <Table color={"green"} key={productData.product.id}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={3} key={`head-${productData.product.id}-name`} >{ LocalizedUtils.getLocalizedValue(productData.product.name) }</Table.HeaderCell>
              <Table.HeaderCell key={`head-${productData.product.id}-ps`} >{ strings.packageSize }</Table.HeaderCell>
              { productData.data[0].dates.map(d => {
                return (
                  <Table.HeaderCell key={`head-${productData.product.id}-${d.header}`}>{d.header}</Table.HeaderCell>
                )
              }) }
              <Table.HeaderCell key={`head-${productData.product.id}-total`}> {strings.total} </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            { productData.data.map( productRowData => {
              return (
                <Table.Row key={`row-${productData.product.id}-${productRowData.packageSize.id}`} >
                  <Table.Cell key={`body-${productData.product.id}-name-${productRowData.packageSize.id}`}></Table.Cell>
                  <Table.Cell key={`body-${productData.product.id}-ps-${productRowData.packageSize.id}`}>{ LocalizedUtils.getLocalizedValue(productRowData.packageSize.name) }</Table.Cell>
                  { productRowData.dates.map(d => {
                    return (
                      <Table.Cell key={`body-${productData.product.id}-${productRowData.packageSize.id}-${d.header}`}>{ d.value }</Table.Cell>
                    )
                  }) }
                  <Table.Cell key={`body-${productData.product.id}-total-${productRowData.packageSize.id}`}>{ productRowData.total }</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      )
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.store}</h2>
        </Grid.Row>  
        <Grid.Row>
          <Grid.Column style={{overflowX: "auto"}}>
            { basicItems }
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Table celled animated>
              <Table.Header>
                <Table.HeaderCell> { strings.campaignName } </Table.HeaderCell>
                <Table.HeaderCell> { strings.amountInStore } </Table.HeaderCell>
              </Table.Header>
              <Table.Body> { this.renderStoreTable(this.state.campaignListItems) } </Table.Body>
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>

    );

  }

  /**
   * Renders store table
   */
  private renderStoreTable = (storeListItems: StoreListItem[]) => {
    return storeListItems.map((item, i) => {
      const packingSizeAmountCells = item.packingSizeAmounts ? item.packingSizeAmounts.map(packingSizeAmount => {
      return (
        <Table.Cell>{ packingSizeAmount }</Table.Cell>
      );
      }) : undefined;

      return (
        <Table.Row style={i % 2 == 0 ? {backgroundColor: "#ddd"} : {}} key={ i }>
          <Table.Cell> { item.name } </Table.Cell>
          <Table.Cell> { item.amountInStore } </Table.Cell>
          { item.oldestDate &&
            <Table.Cell> { item.oldestDate } </Table.Cell>
          }
          {
            packingSizeAmountCells
          }
        </Table.Row>
      );
    });
  }

  /**
   * Counts all products in given packings
   * 
   * @param packings 
   * @param packingSizes 
   */
  private countProducts = (packings: Packing[], packingSizes: PackageSize[]): number => {
    let count = 0;
    packings.forEach(packing => {
      const packingSize = packingSizes.find(packingSize => packingSize.id == packing.packageSizeId);
      if (packing.packedCount && packingSize && packingSize.size) {
        const increaseBy = packingSize.size * packing.packedCount;
        count += increaseBy;
      }
    });

    return count;
  }

  /**
   * Returns the date of the oldest packing in a given list
   * 
   * @param packings 
   */
  private getOldestPackingDate = (packings: Packing[]): string => {
    const dates = packings.map(packing => packing.time.getTime());
    const oldest = Math.min(...dates);
    const oldestDate = new Date(oldest);
    return moment(oldestDate).format("DD.MM.YYYY");
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