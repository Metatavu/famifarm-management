import * as React from "react";
import Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Facility, Product } from "../generated/client";
import strings from "../localization/strings";

import {
  List,
  Button,
  Grid,
  Loader,
  Checkbox
} from "semantic-ui-react";
import LocalizedUtils from "../localization/localizedutils";

export interface Props {
  keycloak?: Keycloak;
  products?: Product[];
  facility: Facility;
  onProductsFound?: (products: Product[]) => void,
  onError: (error: ErrorMessage | undefined) => void
}

export interface State {
  products: Product[];
  showInActive: boolean;
}

class ProductList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      products: [],
      showInActive: false
    };
  }

  /**
   * Component did mount life-sycle event
   */
  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate = async (prevprops: Props, prevstate: State) => {
    if (prevstate.showInActive !== this.state.showInActive) {
      this.loadData();
    }
  }

  /**
   * Render product list view
   */
  public render() {

    const { showInActive } = this.state;

    if (!this.props.products) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    const products = this.props.products.map((product, i) => {
      const productPath = `/products/${product.id}`;
      return (
        <List.Item style={i % 2 === 0 ? {backgroundColor: "#ddd"} : {}} key={product.id}>
          <List.Content floated='right'>
            <NavLink to={productPath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Content>
            <List.Header style={{opacity: product.active ? "1" : "0.2", paddingTop: "10px"}}>{LocalizedUtils.getLocalizedValue(product.name)}</List.Header>
          </List.Content>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.products}</h2>
          <NavLink to="/createProduct">
            <Button className="submit-button">{strings.newProduct}</Button>
          </NavLink>
          <Checkbox checked={showInActive} onChange={() => this.setState({showInActive: !showInActive})} label={strings.showInActiveProductsLabel} />
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List divided animated verticalAlign='middle'>
              {products}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  private loadData = async () => {
    const { showInActive } = this.state;
    const { keycloak, facility } = this.props;
    try {
      if (!keycloak) {
        return;
      }
  
      const productsService = await Api.getProductsService(keycloak);
      const products = await productsService.listProducts({
        includeSubcontractorProducts: true,
        includeInActiveProducts: showInActive,
        facility: facility
      });
      products.sort((a, b) => {
        let aActive = a.active as any;
        let bActive = b.active as any;
        if (aActive - bActive) { return -1 * (aActive - bActive) }
        let nameA = LocalizedUtils.getLocalizedValue(a.name)
        let nameB = LocalizedUtils.getLocalizedValue(b.name)
        if(nameA < nameB) { return -1; }
        if(nameA > nameB) { return 1; }
        return 0;
      });
      this.props.onProductsFound && this.props.onProductsFound(products);
    } catch (e: any) {
      this.props.onError({
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
    product: state.product,
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
    onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductList);