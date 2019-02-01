import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { NavLink } from 'react-router-dom';
import { Product } from 'famifarm-client';

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";

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

  componentDidMount() {
    new FamiFarmApiClient().listProducts(this.props.keycloak!, 0, 100).then((products) => {
      this.props.onProductsFound && this.props.onProductsFound(products);
    });
  }

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
              <Button className="submit-button">Avaa</Button>
            </NavLink>
          </List.Content>
          <List.Header>{product.name![0].value}</List.Header>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={3}>
            <h2>Tuotteet</h2>
          </Grid.Column>
          <Grid.Column width={2} floated="right">
            <NavLink to="/createProduct">
              <Button className="submit-button">Uusi tuote</Button>
            </NavLink>
          </Grid.Column>
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