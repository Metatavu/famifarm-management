import * as React from "react";
import * as Keycloak from 'keycloak-js';
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
  onProductsFound?: (products: Product[]) => void;
}

export interface State {
  products: Product[];
}

class ProductsList extends React.Component<Props, State> {
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
    if (!this.props.keycloak) {
      return;
    }

    const productsService = await Api.getProductsService(this.props.keycloak);
    productsService.listProducts().then((products) => {
      this.props.onProductsFound && this.props.onProductsFound(products);
    });
  }

  /**
   * Render product list view
   */
  render() {
    if (!this.props.products) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader active size="medium" />
        </Grid>
      );
    }

    const products = this.props.products.map((product) => {
      const productPath = `/products/${product.id}`;
      return (
        <List.Item>
          <List.Content floated='right'>
            <NavLink to={productPath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Header>{LocalizedUtils.getLocalizedValue(product.name)}</List.Header>
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
            <List>
              {products}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default ProductsList;