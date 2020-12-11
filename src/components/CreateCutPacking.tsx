import { Product, ProductionLine } from "famifarm-typescript-models";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { Button, Form, Grid, InputOnChangeData, Loader } from "semantic-ui-react";
import { DateInput } from 'semantic-ui-calendar-react';
import strings from "src/localization/strings";
import Api from "../api";
import * as moment from "moment";
import LocalizedUtils from "src/localization/localizedutils";
import { Redirect } from "react-router";
import { FormContainer } from "./FormContainer";
import { ErrorMessage, StoreState } from "src/types";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import * as actions from "../actions";

interface Props {
  keycloak?: KeycloakInstance;
  products?: Product[];
  productionLines?: ProductionLine[];
  onProductionLinesFound: typeof actions.productionLinesFound;
  onProductsFound: typeof actions.productsFound;
  onError: typeof actions.onErrorOccurred;
}

interface State {
  weight: number;
  gutterCount: number;
  gutterHoleCount: number;
  contactInformation: string;
  producer: string;
  cuttingDay: string;
  sowingDay: string;
  selectedProductName?: string;
  selectedProductId?: string;
  selectedProductionLineName?: string;
  selectedProductionLineId?: string;
  storageCondition: string;
  redirect: boolean;
  cutPackingId?: string;
  loading: boolean;
}

class CreateCutPacking extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      weight: 1,
      gutterCount: 1,
      gutterHoleCount: 1,
      contactInformation: "",
      producer: "",
      cuttingDay: moment().toString(),
      sowingDay: moment().toString(),
      storageCondition: "",
      redirect: false,
      loading: false
    }
  }

  /**
   * Loads options for products and production lines
   */
  public componentDidMount = async () => {
    const { keycloak, products, productionLines, onProductionLinesFound, onProductsFound, onError } = this.props;

    if (!keycloak) {
      return;
    }

    try {
      this.setState({ loading: true });

      if (!products) {
        const productsApi = await Api.getProductsService(keycloak);
        const foundProducts = await productsApi.listProducts();
        onProductsFound(foundProducts);
      }

      if (!productionLines) {
        const productionLinesApi = await Api.getProductionLinesService(keycloak);
        const foundProductionLines = await productionLinesApi.listProductionLines();
        onProductionLinesFound(foundProductionLines);
      }

      this.setState({ loading: false });
    } catch (exception) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception
      });
    }
  }

  public render = () => {
    const { 
      redirect, 
      loading, 
      cutPackingId, 
      selectedProductName, 
      selectedProductionLineName,
      weight,
      gutterCount,
      gutterHoleCount,
      contactInformation,
      producer,
      cuttingDay,
      sowingDay,
      storageCondition
    } = this.state;

    if (redirect) {
      return <Redirect to={`/cutPackings/${ cutPackingId }`} push={ true } />;
    }

    if (loading) {
      return (
        <Grid style={{ paddingToSWSsp: "100px" }} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }
    
    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>{ strings.createCutPacking }</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{ strings.product }</label>
                <Form.Select 
                  name="product" 
                  options={ this.getProductOptions() } 
                  text={ selectedProductName ? selectedProductName : strings.selectProduct } 
                  onChange={ this.onChangeProduct } />
              </Form.Field>

              <Form.Field required>
                <label>{ strings.productionLine }</label>
                <Form.Select 
                  name="productionLine" 
                  options={ this.getProductionLineOptions() } 
                  text={ selectedProductionLineName ? selectedProductionLineName : strings.productionLines } 
                  onChange={ this.onChangeProductionLine } />
              </Form.Field>

              <Form.Field required>
                <label>{ strings.weight }</label>
                <Form.Input
                  type="number"
                  name="weight"
                  value={ weight }
                  onChange={ this.onWeightChange }
                />
              </Form.Field>

              <Form.Field required>
                <label>{ strings.gutterCount }</label>
                <Form.Input
                  type="number"
                  name="gutterCount"
                  value={ gutterCount }
                  onChange={ this.onGutterCountChange }
                />
              </Form.Field>

              <Form.Field required>
                <label>{ strings.gutterHoleCount }</label>
                <Form.Input
                  type="number"
                  name="gutterHoleCount"
                  value={ gutterHoleCount }
                  onChange={ this.onGutterHoleCountChange }
                />
              </Form.Field>

              <Form.Field required>
                <label>{ strings.contactInformation }</label>
                <Form.Input
                  name="contactInformation"
                  value={ contactInformation }
                  onChange={ this.onContactInformationChange }
                />
              </Form.Field>

              <Form.Field required>
                <label>{ strings.producer }</label>
                <Form.Input
                  name="producer"
                  value={ producer }
                  onChange={ this.onProducerChange }
                />
              </Form.Field>

              <Form.Field required>
                <label>{ strings.storageCondition }</label>
                <Form.Input
                  name="producer"
                  value={ storageCondition }
                  onChange={ this.onStorageConditionChange }
                />
              </Form.Field>

              <Form.Field required>
                <label>{ strings.sowingDay }</label>
                <DateInput 
                  dateFormat="DD.MM.YYYY" 
                  onChange={ this.onSowingDayChange } 
                  name="sowingDay" 
                  value={ sowingDay ? moment(sowingDay).format("DD.MM.YYYY") : ""} 
                />
              </Form.Field>

              <Form.Field required>
                <label>{ strings.cuttingDay }</label>
                <DateInput 
                  dateFormat="DD.MM.YYYY" 
                  onChange={ this.onCuttingDayChange } 
                  name="cuttingDay" 
                  value={ cuttingDay ? moment(cuttingDay).format("DD.MM.YYYY") : ""} 
                />
              </Form.Field>

              <Button
                className="submit-button"
                onClick={ this.createCutPacking }
                type='submit'
              >
                { strings.save }
              </Button>
            </FormContainer>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }


  /**
   * Handles changing weight
   */
  private onWeightChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ weight: Number.parseInt(value) });
  }

  /**
   * Handles changing gutter count
   */
  private onGutterCountChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ gutterCount: Number.parseInt(value) });
  }

  /**
   * Handles changing gutter hole count
   */
  private onGutterHoleCountChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ gutterHoleCount: Number.parseInt(value) });
  }

  /**
   * Handles changing contact information
   */ 
  private onContactInformationChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ contactInformation: value });
  }

  /**
   * Handles changing producer
   */
  private onProducerChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ producer: value });
  }

  /**
   * Handles changing storage condition
   */
  private onStorageConditionChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ storageCondition: value });
  }

  /**
   * Handles changing sowing day
   */
  private onSowingDayChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ sowingDay: moment(value, "DD.MM.YYYY").toISOString() });
  }

  /**
   * Handles changing cutting day
   */
  private onCuttingDayChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ cuttingDay: moment(value, "DD.MM.YYYY").toISOString() });
  }

  /**
   * Sends a request to the API to create a cut packing and redirects to the edit page
   */
  private createCutPacking = async () => {
    const { keycloak, onError } = this.props;
    const { weight, sowingDay, cuttingDay, gutterCount, gutterHoleCount, selectedProductId, selectedProductionLineId, producer, contactInformation, storageCondition } = this.state;

    if (!keycloak) {
      return;
    }

    try {
      this.setState({ loading: true });
      const cutPackingsApi = await Api.getCutPackingsService(keycloak);
      const newCutPacking = await cutPackingsApi.createPacking({ 
        weight, 
        sowingDay: ( new Date(sowingDay)).toISOString(), 
        cuttingDay: ( new Date(cuttingDay)).toISOString(), 
        gutterCount, 
        gutterHoleCount, 
        productId: selectedProductId!, 
        productionLineId: selectedProductionLineId!, 
        producer, 
        contactInformation, 
        storageCondition 
      });
  
      this.setState({
        cutPackingId: newCutPacking.id,
        redirect: true,
        loading: false
      });
    } catch (exception) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception
      });
    }
  }

  /**
   * Renders product options
   * 
   * @returns product options
   */
  private getProductOptions = (): { text: string, value: string }[] => {
    const { products } = this.props;

    if (!products) {
      return [];
    } 

    let options = [{ text: strings.allProducts, value: "" }];
    for (let i = 0; i < products.length; i++) {
      options.push({ text: LocalizedUtils.getLocalizedValue(products[i].name) || "", value: products[i].id || "" });
    }
    
    return options;
  }

  /**
   * Handles changing selected product
   */
  private onChangeProduct = async (e: any, { name, value }: InputOnChangeData) => {
    const { products } = this.props;

    if (!products) {
      return;
    } 

    let productName = "";

    const product = products.find(product => product.id === value);
    if (!product) {
      return;
    }

    if (product) {
      productName = LocalizedUtils.getLocalizedValue(product.name) || "";
    }

    this.setState({
      selectedProductName: productName,
      selectedProductId: product.id
    });
  }

  /**
   * Returns production line options
   * 
   * @returns production line options
   */
  private getProductionLineOptions = (): { text: string, value: string }[] => {
    const { productionLines } = this.props;

    if (!productionLines) {
      return [];
    }

    let options = [{ text: strings.productionLines, value: "" }];
    for (let i = 0; i < productionLines.length; i++) {
      options.push({ text: productionLines[i].lineNumber || "", value: productionLines[i].id || "" });
    }
    
    return options;
  }

  /**
   * Handles changing selected product
   */
  private onChangeProductionLine = async (e: any, { name, value }: InputOnChangeData) => {
    const { productionLines } = this.props;

    if (!productionLines) {
      return;
    }

    const productionLine = productionLines.find(productionLine => productionLine.id === value);
    if (!productionLine) {
      return;
    }

    if (productionLine.defaultGutterHoleCount) {
      this.setState({
        gutterHoleCount: productionLine.defaultGutterHoleCount
      }); 
    }

    this.setState({
      selectedProductionLineName: productionLine.lineNumber,
      selectedProductionLineId: productionLine.id
    });
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
    productionLines: state.productionLines
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error)),
    onProductsFound: (products: Product[]) => dispatch(actions.productsFound(products)),
    onProductionLinesFound: (productionLines: ProductionLine[]) => dispatch(actions.productionLinesFound(productionLines))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateCutPacking);