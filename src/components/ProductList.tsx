import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Product } from "famifarm-typescript-models";
import strings from "src/localization/strings";

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";
import LocalizedUtils from "src/localization/localizedutils";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  products?: Product[];
  onProductsFound?: (products: Product[]) => void,
  onError: (error: ErrorMessage) => void
}

export interface State {
  products: Product[];
}

class ProductList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      products: []
    };
  }

  /**
   * Component did mount life-sycle event
   */
  async componentDidMount() {
    try {
      if (!this.props.keycloak) {
        return;
      }
  
      const productsService = await Api.getProductsService(this.props.keycloak);
      const products = await productsService.listProducts();
      products.sort((a, b) => {
        let nameA = LocalizedUtils.getLocalizedValue(a.name)
        let nameB = LocalizedUtils.getLocalizedValue(b.name)
        if(nameA < nameB) { return -1; }
        if(nameA > nameB) { return 1; }
        return 0;
      });
      this.props.onProductsFound && this.props.onProductsFound(products);
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Render product list view
   */
  public render() {
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
        <List.Item style={i % 2 == 0 ? {backgroundColor: "#ddd"} : {}} key={product.id}>
          <List.Content floated='right'>
            <NavLink to={productPath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Content>
            <List.Header style={{paddingTop: "10px"}}>{LocalizedUtils.getLocalizedValue(product.name)}</List.Header>
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
}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    products: state.products,
    product: state.product
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
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductList);