import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Batch, Product } from "famifarm-typescript-models";
import strings from "src/localization/strings";
import * as moment from "moment";
import * as actions from "../actions";
import { StoreState, ErrorMessage } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  List,
  Button,
  Grid,
  Loader,
  Label,
  Form,
  InputOnChangeData,
  TextAreaProps,
  Visibility
} from "semantic-ui-react";
import { DateInput } from 'semantic-ui-calendar-react';
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
  date?: string
  selectedProduct?: string
  selectedProductName?: string
  status: string
  loading: boolean
  errorCount: number,
  firstResult: number
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
      errorCount: 0,
      firstResult: 0
    };;
  }

  /**
   * Component did mount life-sycle event
   */
  public async componentDidMount() {
    try {
      await this.updateBatches(this.state.status, this.state.firstResult);
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


    return `${productName} - ${batchDate} ( ${strings[`batchPhase${batch.phase}`]} ) ${batch.sowingLineNumbers || [].join(", ")}`;
  }

  /**
   * Render batch list view
   */
  public render() {
    if (this.state.loading && this.state.firstResult === 0) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    const possibleLoader = (): any => {
      if (this.state.loading) {
        return <Loader inline active size="medium" />
      }
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
          <Form>
            <Form.Field>
              <div style={{display:"inline-block", paddingTop: "2rem", paddingBottom: "2rem", paddingRight: "2rem"}}>
                <label>{strings.date}</label>
                <DateInput dateFormat="DD.MM.YYYY" onChange={this.onChangeDate} name="date" value={this.state.date ? moment(this.state.date).format("DD.MM.YYYY") : ""} />
              </div>
              <div style={{display:"inline-block", paddingTop: "2rem", paddingBottom: "2rem"}}>
                <label>{strings.productName}</label>
                <Form.Select name="product" options={this.renderOptions()} text={this.state.selectedProductName ? this.state.selectedProductName : strings.selectProduct} onChange={this.onChangeProduct} />
              </div>
            </Form.Field>
          </Form>
        </Grid.Row>
        <Grid.Row>
          {statusButtons}
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
          <Visibility onUpdate={this.loadMoreBatches}>
            <List divided animated verticalAlign='middle'>
              {batches}
            </List>
          </Visibility>
          </Grid.Column>
        </Grid.Row>
        {possibleLoader()}
      </Grid>
    );
  }

  /**
   * Handles status button click
   */
  private handleButtonClick = (status: string) => {
    this.setState({
      status: status,
      firstResult: 0
    });
    this.updateBatches(status, 0).catch((err) => {
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
  private onChangeDate = async (e: any, { value }: InputOnChangeData) => {
    await this.setState({date: moment(value, "DD.MM.YYYY").toISOString(), firstResult: 0});

    await this.updateBatches(this.state.status, 0).catch((err) => {
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
  private onChangeProduct = async (e: any, { name, value }: InputOnChangeData | TextAreaProps) => {
    let productName = "";
    if (this.props.products) {
      let object = this.props.products.find(product => product.id === value);
      if (object) {
        productName = LocalizedUtils.getLocalizedValue(object.name) || "";
      }
    }
    await this.setState({
      selectedProduct: value !== "" ? String(value) : undefined,
      selectedProductName: productName,
      firstResult: 0
    });

    await this.updateBatches(this.state.status, 0).catch((err) => {
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
      let options = [{text: strings.allProducts, value: ""}];
      for (let i = 0; i < this.props.products.length; i++) {
        options.push({text: LocalizedUtils.getLocalizedValue(this.props.products[i].name) || "", value: this.props.products[i].id || ""});
      }
      return options;
    } else {
      return [{text:"", value:""}];
    }
  }

  /**
   * Loads more batches
   */
  private loadMoreBatches = async (e: any, { calculations }: any) => {
    if (calculations.bottomVisible === true && !this.state.loading) {
      const firstResult = this.state.firstResult + 21;
      await this.setState({firstResult});
      await this.updateBatches(this.state.status, firstResult);
    }
  }

  /**
   * Updates batch list
   */
  private updateBatches = async (status: string, firstResult: number) => {
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
      batchesService.listBatches(status, undefined, this.state.selectedProduct, firstResult, 20, createdBefore, createdAfter),
      productsService.listProducts(),
      batchesService.listBatches("NEGATIVE")
    ]);

    if (firstResult === 0) {
      this.props.onBatchesFound && this.props.onBatchesFound(batches);
    } else {
      this.props.onBatchesFound && this.props.onBatchesFound(this.props.batches!!.concat(batches));
    }
    
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