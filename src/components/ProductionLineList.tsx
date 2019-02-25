import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { ProductionLine } from "famifarm-typescript-models";
import strings from "src/localization/strings";

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  productionLines?: ProductionLine[];
  onProductionLinesFound?: (productionLines: ProductionLine[]) => void;
}

export interface State {
  productionLines: ProductionLine[];
}

class ProductionLinesList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      productionLines: []
    };
  }

  /**
   * Component did mount life-sycle event
   */
  async componentDidMount() {
    if (!this.props.keycloak) {
      return;
    }

    const productionLinesService = await Api.getProductionLinesService(this.props.keycloak);
    productionLinesService.listProductionLines().then((productionLines) => {
      this.props.onProductionLinesFound && this.props.onProductionLinesFound(productionLines);
    });
  }

  /**
   * Render production line list view
   */
  render() {
    if (!this.props.productionLines) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader active size="medium" />
        </Grid>
      );
    }

    const productionLines = this.props.productionLines.map((productionLine) => {
      const productionLinePath = `/productionLines/${productionLine.id}`;
      return (
        <List.Item key={productionLine.id}>
          <List.Content floated='right'>
            <NavLink to={productionLinePath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Header>{productionLine.lineNumber}</List.Header>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.productionLines}</h2>
          <NavLink to="/createProductionLine">
            <Button className="submit-button">{strings.newProductionLine}</Button>
          </NavLink>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List>
              {productionLines}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default ProductionLinesList;