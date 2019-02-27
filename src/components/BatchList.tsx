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
  location?: any,
  onBatchesFound?: (batches: Batch[]) => void;
  onProductsFound?: (products: Product[]) => void;
}

/**
 * Interface representing component state
 */
interface State {
  batches: Batch[]
  status: string
  loading: boolean
}

/**
 * React component for displaying list of batches
 */
class BatchList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      batches: [],
      status: "OPEN",
      loading: false
    };
  }

  /**
   * Component did mount life-sycle event
   */
  public async componentDidMount() {
    this.updateBatches(this.state.status);
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
    if (this.state.loading) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader active size="medium" />
        </Grid>
      );
    }

    const statusButtons = ["OPEN", "CLOSED", "NEGATIVE"].map((status: string) => {
      return (
        <Button onClick={() => this.handleButtonClick(status)} key={status} active={this.state.status === status} >
          {strings.getString(`batchStatusButton${status}`, strings.getLanguage())}
        </Button>
      );
    });

    const batches = (this.props.batches || []).map((batch) => {
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
          {statusButtons}
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

  /**
   * Handles status button click
   */
  private handleButtonClick = (status: string) => {
    this.setState({
      status: status
    });

    this.updateBatches(status);
  }

  /**
   * Updates batch list
   */
  private updateBatches = async (status: string) => {
    if (!this.props.keycloak) {
      return;
    }
    this.setState({loading: true});
    const [batchesService, productsService] = await Promise.all([
      Api.getBatchesService(this.props.keycloak),
      Api.getProductsService(this.props.keycloak)
    ]);

    const [batches, products] = await Promise.all([batchesService.listBatches(status), productsService.listProducts()]);
    this.props.onBatchesFound && this.props.onBatchesFound(batches);
    this.props.onProductsFound && this.props.onProductsFound(products);
    this.setState({loading: false})
  }
}

export default BatchList;