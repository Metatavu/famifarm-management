import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Batch, Product } from "famifarm-typescript-models";
import strings from "src/localization/strings";
import * as moment from "moment";
import * as actions from "../actions";
import { StoreState, ErrorMessage } from "../types/index";
import DatePicker from "react-date-picker";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Dropdown, { Option } from 'react-dropdown';
import 'react-dropdown/style.css';

import {
  List,
  Button,
  Grid,
  Loader,
  Label
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
  onBatchesFound?: (batches: Batch[]) => void,
  onProductsFound?: (products: Product[]) => void,
  onError: (error: ErrorMessage) => void
}

/**
 * Interface representing component state
 */
interface State {
  batches: Batch[]
  date?: Date
  selectedProduct?: string
  selectedProductName?: string
  status: string
  loading: boolean
  errorCount: number
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
      loading: false,
      errorCount: 0
    };
  }

  /**
   * Component did mount life-sycle event
   */
  public async componentDidMount() {
    try {
      await this.updateBatches(this.state.status);
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  private getBatchName = (batch: Batch): string => {
    const products = this.props.products || [];
    const batchProduct = products.find((product) => product.id === batch.productId);
    const productName = batchProduct ? LocalizedUtils.getLocalizedValue(batchProduct.name) : batch.id;
    const batchDate = moment(batch.createdAt).format("DD.MM.YYYY");


    return `${productName} - ${batchDate} ( ${strings[`batchPhase${batch.phase}`]})`;
  }

  /**
   * Render batch list view
   */
  public render() {
    if (this.state.loading) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    const statusButtons = ["OPEN", "CLOSED", "NEGATIVE"].map((status: string) => {
      return (
        <Button onClick={() => this.handleButtonClick(status)} key={status} active={this.state.status === status} >
          {strings.getString(`batchStatusButton${status}`, strings.getLanguage())}
          {status === "NEGATIVE" && this.state.errorCount > 0 &&
            <Label style={{position: "absolute", top: "5px"}} size="mini" circular color='red'>{this.state.errorCount}</Label>
          }
        </Button>
      );
    });

    const batches = (this.props.batches || []).map((batch, i) => {
      return (
        <List.Item style={i % 2 == 0 ? {backgroundColor: "#ddd"} : {}} key={batch.id}>
          <List.Content floated='right'>
            <NavLink to={`/batches/${batch.id}`}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Content>
            <List.Header style={{paddingTop: "10px"}}>{this.getBatchName(batch)}</List.Header>
          </List.Content>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.batches}</h2>
          <NavLink to="/createBatch">
            <Button className="submit-button">{strings.newBatch}</Button>
          </NavLink>
        </Grid.Row>
        <Grid.Row>
          <div style={{ paddingRight: "2rem", paddingTop: "2rem", paddingBottom: "2rem" }}>
            <DatePicker format="dd.MM.y" onChange={this.onChangeDate} value={this.state.date} />
          </div>
          <div style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
            <Dropdown options={this.renderOptions()} onChange={this.onChangeProduct} value={ this.state.selectedProductName ? this.state.selectedProductName : strings.selectProduct } />
          </div>
        </Grid.Row>
        <Grid.Row>
          {statusButtons}
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List divided animated verticalAlign='middle'>
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

    this.updateBatches(status).catch((err) => {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: err
      });
    });
  }

  /**
   * Handles changing date
   */
  private onChangeDate = async (date: Date) => {
    await this.setState({date: date});

    await this.updateBatches(this.state.status).catch((err) => {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: err
      });
    });
  }

  /**
   * Handles changing selected product
   */
  private onChangeProduct = async (product: Option) => {
    await this.setState({
      selectedProduct: product.value !== "" ? product.value : undefined,
      selectedProductName: String(product.label) || ""
    });

    await this.updateBatches(this.state.status).catch((err) => {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: err
      });
    });
  }

  /**
   * Renders dropdown options
   */
  private renderOptions = () => {
    if (this.props.products) {
      let options = [{label: strings.allProducts, value: ""}];
      for (let i = 0; i < this.props.products.length; i++) {
        options.push({label: LocalizedUtils.getLocalizedValue(this.props.products[i].name) || "", value: this.props.products[i].id || ""});
      }
      return options;
    } else {
      return [""];
    }
  }

  /**
   * Updates batch list
   */
  private updateBatches = async (status: string) => {
    if (!this.props.keycloak) {
      return;
    }

    const createdBefore = this.state.date ? moment(this.state.date).endOf("day").toISOString() : undefined;
    const createdAfter = this.state.date ? moment(this.state.date).startOf("day").toISOString() : undefined;
    this.setState({loading: true});
    const [batchesService, productsService] = await Promise.all([
      Api.getBatchesService(this.props.keycloak),
      Api.getProductsService(this.props.keycloak)
    ]);

    const [batches, products, errorBatches] = await Promise.all([
      batchesService.listBatches(status, undefined, this.state.selectedProduct, undefined, undefined, createdBefore, createdAfter),
      productsService.listProducts(),
      batchesService.listBatches("NEGATIVE")
    ]);
    this.props.onBatchesFound && this.props.onBatchesFound(batches);
    this.props.onProductsFound && this.props.onProductsFound(products);
    this.setState({loading: false, errorCount: errorBatches.length})
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
    batches: state.batches
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
    onBatchesFound: (batches: Batch[]) => dispatch(actions.batchesFound(batches)),
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchList);