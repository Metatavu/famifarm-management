import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Batch, Product } from "famifarm-typescript-models";
import strings from "src/localization/strings";
import * as moment from "moment";

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";
import LocalizedUtils from "src/localization/localizedutils";


/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  batches?: Batch[];
  products?: Product[];
  onBatchesFound?: (batches: Batch[]) => void;
  onProductsFound?: (products: Product[]) => void;
}

/**
 * Interface representing component state
 */
interface State {
  batches: Batch[];
}

/**
 * React component for displaying list of batches
 */
class BatchList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      batches: []
    };
  }

  /**
   * Component did mount life-sycle event
   */
  async componentDidMount() {
    if (!this.props.keycloak) {
      return;
    }

    const [batchesService, productsService] = await Promise.all([
      Api.getBatchesService(this.props.keycloak),
      Api.getProductsService(this.props.keycloak)
    ]);

    batchesService.listBatches().then((batches) => {
      this.props.onBatchesFound && this.props.onBatchesFound(batches);
    });
    productsService.listProducts().then((products) => {
      this.props.onProductsFound && this.props.onProductsFound(products);
    });
  }

  private getBatchName = (batch: Batch): string => {
    const products = this.props.products || [];
    const batchProduct = products.find((product) => product.id === batch.productId);
    const productName = batchProduct ? LocalizedUtils.getLocalizedValue(batchProduct.name) : batch.id;
    const batchDate = moment(batch.createdAt).format("DD.MM.YYYY");
    return `${productName} - ${batchDate}`;
    
  }

  /**
   * Render batch list view
   */
  public render() {
    if (!this.props.batches) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader active size="medium" />
        </Grid>
      );
    }

    const batches = this.props.batches.map((batch) => {
      return (
        <List.Item>
          <List.Content floated='right'>
            <NavLink to={`/batches/${batch.id}`}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Header>{this.getBatchName(batch)}</List.Header>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.batches}</h2>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List>
              {batches}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default BatchList;