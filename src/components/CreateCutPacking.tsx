import { Product, ProductionLine } from "famifarm-typescript-models";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { Button, Form, Grid, InputOnChangeData } from "semantic-ui-react";
import { DateInput } from 'semantic-ui-calendar-react';
import strings from "src/localization/strings";
import Api from "../api";
import * as moment from "moment";
import LocalizedUtils from "src/localization/localizedutils";
import { Redirect } from "react-router";
import { FormContainer } from "./FormContainer";

interface Props {
  keycloak?: KeycloakInstance;
}

interface State {
  products: Product[];
  productionLines: ProductionLine[];
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
}

class CreateCutPacking extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      products: [],
      weight: 1,
      gutterCount: 1,
      gutterHoleCount: 1,
      contactInformation: "",
      producer: "",
      cuttingDay: moment().toString(),
      sowingDay: moment().toString(),
      productionLines: [],
      storageCondition: "",
      redirect: false
    }
  }

  public componentDidMount = async () => {
    const { keycloak } = this.props;

    if (!keycloak) {
      return;
    }

    const [productsApi, productionLinesApi] = await Promise.all([Api.getProductsService(keycloak), Api.getProductionLinesService(keycloak)]);
    const [products, productionLines] = await Promise.all([productsApi.listProducts(), productionLinesApi.listProductionLines()]);
    this.setState({ products, productionLines });
  }

  public render = () => {
    if (this.state.redirect) {
      return <Redirect to={`/cutPackings/${this.state.cutPackingId}`} push={true} />;
    }
    
    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>{strings.createCutPacking}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{ strings.product }</label>
                <Form.Select name="product" options={ this.renderProductOptions() } text={ this.state.selectedProductName ? this.state.selectedProductName : strings.selectProduct } onChange={ this.onChangeProduct } />
              </Form.Field>
              <Form.Field required>
                <label>{ strings.productionLine }</label>
                <Form.Select name="productionLine" options={ this.renderProductionLineOptions() } text={ this.state.selectedProductionLineName ? this.state.selectedProductionLineName : strings.productionLines } onChange={ this.onChangeProductionLine } />
              </Form.Field>
              <Form.Field required>
                <label>{ strings.weight }</label>
                <Form.Input
                  type="number"
                  name="weight"
                  value={ this.state.weight }
                  onChange={ this.onWeightChange }
                />
              </Form.Field>
              <Form.Field required>
                <label>{ strings.gutterCount }</label>
                <Form.Input
                  type="number"
                  name="gutterCount"
                  value={ this.state.gutterCount }
                  onChange={ this.onGutterCountChange }
                />
              </Form.Field>
              <Form.Field required>
                <label>{ strings.gutterHoleCount }</label>
                <Form.Input
                  type="number"
                  name="gutterHoleCount"
                  value={ this.state.gutterHoleCount }
                  onChange={ this.onGutterHoleCountChange }
                />
              </Form.Field>
              <Form.Field required>
                <label>{ strings.contactInformation }</label>
                <Form.Input
                  name="contactInformation"
                  value={ this.state.contactInformation }
                  onChange={ this.onContactInformationChange }
                />
              </Form.Field>
              <Form.Field required>
                <label>{ strings.producer }</label>
                <Form.Input
                  name="producer"
                  value={ this.state.producer }
                  onChange={ this.onProducerChange }
                />
              </Form.Field>
              <Form.Field required>
                <label>{ strings.storageCondition }</label>
                <Form.Input
                  name="producer"
                  value={ this.state.storageCondition }
                  onChange={ this.onStorageConditionChange }
                />
              </Form.Field>
              <Form.Field required>
                <label>{ strings.sowingDay }</label>
                <DateInput dateFormat="DD.MM.YYYY" onChange={ this.onSowingDayChange } name="sowingDay" value={ this.state.sowingDay ? moment(this.state.sowingDay).format("DD.MM.YYYY") : ""} />
              </Form.Field>
              <Form.Field required>
                <label>{ strings.cuttingDay }</label>
                <DateInput dateFormat="DD.MM.YYYY" onChange={ this.onCuttingDayChange } name="cuttingDay" value={ this.state.cuttingDay ? moment(this.state.cuttingDay).format("DD.MM.YYYY") : ""} />
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

  private onGutterCountChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ gutterCount: Number.parseInt(value) });
  }

  private onGutterHoleCountChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ gutterHoleCount: Number.parseInt(value) });
  }

  private onContactInformationChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ contactInformation: value });
  }

  private onProducerChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ producer: value });
  }

  private onStorageConditionChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ storageCondition: value });
  }

  private onSowingDayChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ sowingDay: moment(value, "DD.MM.YYYY").toISOString() });
  }

  private onCuttingDayChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ cuttingDay: moment(value, "DD.MM.YYYY").toISOString() });
  }

  private createCutPacking = async () => {
    const { keycloak } = this.props;
    const { weight, sowingDay, cuttingDay, gutterCount, gutterHoleCount, selectedProductId, selectedProductionLineId, producer, contactInformation, storageCondition } = this.state;

    if (!keycloak) {
      return;
    }

    const cutPackingsApi = await Api.getCutPackingsService(keycloak);
    const newCutPacking = await cutPackingsApi.createPacking({ weight, sowingDay, cuttingDay, gutterCount, gutterHoleCount, productId: selectedProductId!, productionLineId: selectedProductionLineId!, producer, contactInformation, storageCondition });

    this.setState({
      cutPackingId: newCutPacking.id,
      redirect: true
    });
  }

  /**
   * Renders product options
   */
  private renderProductOptions = () => {
    const { products } = this.state;


    let options = [{text: strings.allProducts, value: ""}];
    for (let i = 0; i < products.length; i++) {
      options.push({text: LocalizedUtils.getLocalizedValue(products[i].name) || "", value: products[i].id || ""});
    }
    
    return options;
  }

  /**
   * Handles changing selected product
   */
  private onChangeProduct = async (e: any, { name, value }: InputOnChangeData) => {
    let productName = "";

    const product = this.state.products.find(product => product.id === value);
    if (product) {
      productName = LocalizedUtils.getLocalizedValue(product.name) || "";
    }

    this.setState({
      selectedProductName: productName,
      selectedProductId: product!.id
    });
  }

  /**
   * Renders product options
   */
  private renderProductionLineOptions = () => {
    const { productionLines } = this.state;


    let options = [{text: strings.productionLines, value: ""}];
    for (let i = 0; i < productionLines.length; i++) {
      options.push({text: productionLines[i].lineNumber || "", value: productionLines[i].id || ""});
    }
    
    return options;
  }

  /**
   * Handles changing selected product
   */
  private onChangeProductionLine = async (e: any, { name, value }: InputOnChangeData) => {

    const productionLine = this.state.productionLines.find(productionLine => productionLine.id === value);

    this.setState({
      selectedProductionLineName: productionLine!.lineNumber,
      selectedProductionLineId: productionLine!.id
    });
  }
}