import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Packing, Product } from "famifarm-typescript-models";
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
  TextAreaProps
} from "semantic-ui-react";
import { DateInput } from 'semantic-ui-calendar-react';
import LocalizedUtils from "src/localization/localizedutils";


/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  packings?: Packing[];
  products?: Product[];
  location?: any,
  onPackingsFound?: (packings: Packing[]) => void,
  onProductsFound?: (products: Product[]) => void,
  onError: (error: ErrorMessage) => void
}

/**
 * Interface representing component state
 */
interface State {
  packings: Packing[]
  date?: string
  selectedProduct?: string
  selectedProductName?: string
  status: string
  loading: boolean
  errorCount: number
}

/**
 * React component for displaying list of packings
 */
class PackingList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      packings: [],
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
      await this.updatePackings(this.state.status);
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  private getPackingName = (packing: Packing): string => {
    const products = this.props.products || [];
    const packingProduct = products.find((product) => product.id === packing.productId);
    const productName = packingProduct ? LocalizedUtils.getLocalizedValue(packingProduct.name) : packing.id;
    const packingDate = moment(packing.time).format("DD.MM.YYYY");

    return `${productName} - ${packingDate}`;
  }

  /**
   * Render packing list view
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
          {strings.getString(`packingStatusButton${status}`, strings.getLanguage())}
          {status === "NEGATIVE" && this.state.errorCount > 0 &&
            <Label style={{position: "absolute", top: "5px"}} size="mini" circular color='red'>{this.state.errorCount}</Label>
          }
        </Button>
      );
    });

    const packings = (this.props.packings || []).map((packing, i) => {
      return (
        <List.Item style={i % 2 == 0 ? {backgroundColor: "#ddd"} : {}} key={packing.id}>
          <List.Content floated='right'>
            <NavLink to={`/packings/${packing.id}`}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Content>
            <List.Header style={{paddingTop: "10px"}}>{this.getPackingName(packing)}</List.Header>
          </List.Content>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.packings}</h2>
          <NavLink to="/createPacking">
            <Button className="submit-button">{strings.newPacking}</Button>
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
            <List divided animated verticalAlign='middle'>
              {packings}
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

    this.updatePackings(status).catch((err) => {
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
    await this.setState({date: moment(value, "DD.MM.YYYY").toISOString()});

    await this.updatePackings(this.state.status).catch((err) => {
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
      selectedProductName: productName
    });

    await this.updatePackings(this.state.status).catch((err) => {
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
   * Updates packings list
   */
  private updatePackings = async (status: string) => {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({loading: true});
    const [packingsService, productsService] = await Promise.all([
      Api.getPackingsService(this.props.keycloak),
      Api.getProductsService(this.props.keycloak)
    ]);

    const [packings, products, errorPackings] = await Promise.all([
      packingsService.listPackings(undefined, undefined, undefined, undefined, undefined, undefined),
      productsService.listProducts(),
      packingsService.listPackings(-1)
    ]);
    this.props.onPackingsFound && this.props.onPackingsFound(packings);
    this.props.onProductsFound && this.props.onProductsFound(products);
    this.setState({loading: false, errorCount: errorPackings.length})
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
    packings: state.packings
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
    onPackingsFound: (packings: Packing[]) => dispatch(actions.packingsFound(packings)),
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PackingList);