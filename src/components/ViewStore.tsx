import Api  from "src/api";
import * as React from "react";
import { StoreState } from "src/types";
import { Dispatch } from "redux";
import * as actions from "../actions";
import { connect } from "react-redux";
import { PackageSize, Packing } from "famifarm-typescript-models";
import LocalizedUtils from "src/localization/localizedutils";
import { Grid, Loader, List } from "semantic-ui-react";
import strings from "src/localization/strings";

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
  storeListItems: StoreListItem[],
  loading: boolean
}

interface StoreListItem {
  productName: string;
  amountInStore: number;
  oldestDate: string;
}

class ViewStore extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      storeListItems: [],
      loading: false
    };
  }

  public componentDidMount = async () => {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({ loading: true });

    const { keycloak } = this.props;

    const [productsApi, packingSizesApi, packingsApi] = await Promise.all([Api.getProductsService(keycloak), Api.getPackageSizesService(keycloak), Api.getPackingsService(keycloak)]);
    const [products, packingSizes]= await Promise.all([productsApi.listProducts(), packingSizesApi.listPackageSizes()]);

    const packingsInStoreByProduct = (await Promise.all(products.map(product => {
      return packingsApi.listPackings(undefined, undefined, product.id, "IN_STORE");
    }))).filter(packings => packings.length > 0);

    const storeListItems = packingsInStoreByProduct.map(packings => {
      const amountInStore = this.countProducts(packings, packingSizes);
      const productId = packings[0].productId;
      const productNameLocalizedEntry = products.find(product => product.id!! == productId!!)!!.name;
      const productName = LocalizedUtils.getLocalizedValue(productNameLocalizedEntry);
      const oldestDate = this.getOldestPackingDate(packings);

      return { amountInStore, productName, oldestDate };
    });

    this.setState({ storeListItems, loading: false });
  }

  public render = () => {
    if (this.state.loading) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    return (
      <Grid>
        <Grid.Row>
          <Grid.Column>
            <List divided animated verticalAlign='middle'>
              { this.renderStoreListItems() }
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>

    );

  }

  /**
   * Renders store list items
   */
  private renderStoreListItems = () => {
    return this.state.storeListItems.map((storeListItem, i) => {
      return (
        <List.Item style={i % 2 == 0 ? {backgroundColor: "#ddd"} : {}} key={ storeListItem.oldestDate }>
          <List.Content>
            <List.Header style={{paddingTop: "10px"}}>{ this.resolveListItemText(storeListItem) }</List.Header>
          </List.Content>
        </List.Item>
      );
    });
  }

  /**
   * Resolves list item text
   * 
   * @param storeListItem 
   */
  private resolveListItemText = (storeListItem: StoreListItem): string => {
    return  `${ strings.productName }:  ${ storeListItem.productName }, ${ strings.amountInStore }: ${ storeListItem.amountInStore },  ${ strings.oldestPackingInStore }: ${ storeListItem.oldestDate }`
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
    return oldestDate.toISOString().split("T")[0];
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