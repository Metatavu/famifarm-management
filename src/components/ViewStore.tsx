import Api  from "src/api";
import * as React from "react";
import { StoreState } from "src/types";
import { Dispatch } from "redux";
import * as actions from "../actions";
import { connect } from "react-redux";
import { PackageSize, Packing } from "famifarm-typescript-models";
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
  productListItems: StoreListItem[],
  campaignListItems: StoreListItem[],
  loading: boolean,
  packingSizes: PackageSize[]
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
    const [products, packingSizes, campaigns]= await Promise.all([productsApi.listProducts(), packingSizesApi.listPackageSizes(), campaignsApi.listCampaigns()]);

    const packings = await packingsApi.listPackings(undefined, undefined, undefined, "IN_STORE");
    let packingsInStoreByProduct = products.map(product => {
      return packings.filter(packing => packing.productId == product.id);
    });
    packingsInStoreByProduct = packingsInStoreByProduct.filter(packings => packings.length > 0);

    let packingsInStoreByCampaign = campaigns.map(campaign => {
      return packings.filter(packing => packing.campaignId === campaign.id);
    })

    packingsInStoreByCampaign = packingsInStoreByCampaign.filter(packings => packings.length > 0);

    const productListItems = packingsInStoreByProduct.map(packings => {
      const amountInStore = this.countProducts(packings, packingSizes);
      const productId = packings[0].productId;
      const productNameLocalizedEntry = products.find(product => product.id == productId)!!.name;
      const name = LocalizedUtils.getLocalizedValue(productNameLocalizedEntry);
      const oldestDate = this.getOldestPackingDate(packings);

      const packingSizeAmounts = packingSizes.map(packingSize => {
        return packings.filter(packing => packing.packageSizeId == packingSize.id).length;
      });

      return { amountInStore, name, oldestDate, packingSizeAmounts };
    });

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

    const packingSizeNames = this.state.packingSizes.map(packingSize => {
      return (
        <Table.HeaderCell>{ LocalizedUtils.getLocalizedValue(packingSize.name) }</Table.HeaderCell>
      );
    })

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.store}</h2>
        </Grid.Row>  
        <Grid.Row>
          <Grid.Column>
            <Table celled animated>
              <Table.Header>
                <Table.HeaderCell> { strings.productName } </Table.HeaderCell>
                <Table.HeaderCell> { strings.amountInStore } </Table.HeaderCell>
                <Table.HeaderCell> { strings.oldestPackingInStore } </Table.HeaderCell>
                { packingSizeNames }
              </Table.Header>
              <Table.Body> { this.renderStoreTable(this.state.productListItems) } </Table.Body>
            </Table>
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
    const dates = packings.map(packing => Date.parse(packing.time));
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