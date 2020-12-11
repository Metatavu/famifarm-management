import { Printer, Product, ProductionLine } from "famifarm-typescript-models";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { Button, Confirm, Form, Grid, InputOnChangeData, Loader, Message, Select } from "semantic-ui-react";
import { DateInput } from 'semantic-ui-calendar-react';
import strings from "src/localization/strings";
import Api from "../api";
import * as moment from "moment";
import LocalizedUtils from "src/localization/localizedutils";
import { Redirect } from "react-router";
import { FormContainer } from "./FormContainer";
import { connect } from "react-redux";
import { ErrorMessage, StoreState } from "src/types";
import { Dispatch } from "redux";
import * as actions from "../actions";

interface Props {
  keycloak?: KeycloakInstance;
  cutPackingId: string;
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
  messageVisible: boolean;
  printers: Printer[];
  printing: boolean;
  selectedPrinter?: Printer;
  refreshingPrinters: boolean;
  confirmOpen: boolean;
}

class EditCutPacking extends React.Component<Props, State> {
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
      loading: false,
      messageVisible: false,
      printers: [],
      printing: false,
      refreshingPrinters: false,
      confirmOpen: false
    }
  }

  public componentDidMount = async () => {
    const { keycloak, cutPackingId, onError } = this.props;

    if (!keycloak) {
      return;
    }

    try {
      this.setState({ loading: true });
      const cutPackingsApi = await Api.getCutPackingsService(keycloak);
      const cutPacking = await cutPackingsApi.findPacking(cutPackingId);
      const { products, productionLines } = await this.loadDataForDropdowns(keycloak);
      const { weight, gutterCount, gutterHoleCount, contactInformation, producer, cuttingDay, sowingDay, storageCondition, productId, productionLineId } = cutPacking;
      const selectedProduct = products.find(product => product.id === productId);
      const selectedProductName = selectedProduct ? LocalizedUtils.getLocalizedValue(selectedProduct.name) : "";
      const selectedProductionLine = productionLines.find(productionLine => productionLineId === productionLine.id);
      const selectedProductionLineName = selectedProductionLine ? selectedProductionLine.lineNumber : "";

      await this.refreshPrinters();

      this.setState({
        weight,
        gutterCount,
        gutterHoleCount,
        contactInformation,
        producer,
        cuttingDay,
        sowingDay,
        storageCondition,
        selectedProductName,
        selectedProductionLineName,
        selectedProductId: productId,
        selectedProductionLineId: productionLineId,
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

  public render = () => {
    const { 
      redirect, 
      loading, 
      printers, 
      selectedProductName, 
      selectedProductionLineName,   
      weight,
      messageVisible,
      gutterCount,
      gutterHoleCount,
      contactInformation,
      producer,
      cuttingDay,
      sowingDay,
      storageCondition,
      selectedPrinter,
      refreshingPrinters,
      printing,
      confirmOpen
    } = this.state;

    if (redirect) {
      return <Redirect to={`/cutPackings}`} push={true} />;
    }

    if (loading) {
      return (
        <Grid style={{ paddingToSWSsp: "100px" }} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    const printerOptions = printers.map((printer: Printer) => {
      return { text: printer.name, value: printer.id };
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>{ strings.editCutPacking }</h2>
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
                  onChange={ this.onChangeProduct } 
                />
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
                  onChange={this.onProducerChange}
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
                  value={ sowingDay ? moment(sowingDay).format("DD.MM.YYYY") : "" } 
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

              <Message
                  success
                  visible={ messageVisible }
                  header={ strings.savedSuccessfully }
                />

              <Button
                className="submit-button"
                onClick={ this.updateCutPacking }
                type='submit'
              >
                { strings.save }
              </Button>
            </FormContainer>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
             <h2>{ strings.printPacking }</h2>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
          <Select
            options={ printerOptions }
            text={ selectedPrinter ? selectedPrinter.name : strings.selectPrinter }
            value={ selectedPrinter ? selectedPrinter.id : undefined }
            onChange={ this.onPrinterChange }
          />
            <Button 
              style={{ marginLeft: 10 }} 
              loading={ refreshingPrinters } 
              className="submit-button" 
              onClick={ this.refreshPrinters } 
              type='submit'>
                { strings.update }
            </Button>
          </Grid.Column>
        </Grid.Row>


        <Grid.Row>
          <Grid.Column width={8}>
            <Button 
              disabled={ printing } 
              loading={ printing } 
              className="submit-button" 
              onClick={ this.print } 
              type='submit'>{ strings.print }
            </Button>
          </Grid.Column>
        </Grid.Row>

        <Confirm
          open={ confirmOpen }
          size="mini"
          content={ strings.deleteConfirmationText + this.getPackingName() + "?" }
          onCancel={ () => this.setState({ confirmOpen : false }) }
          onConfirm={ this.handleDelete }
        />
      </Grid>
    );
  }

  /**
   * Loads data for dropdowns
   * 
   * @param keycloak a keycloak instance to use for API-requests
   * 
   * @returns data for dropdowns
   */
  private loadDataForDropdowns = async (keycloak: KeycloakInstance): Promise<{ products: Product[], productionLines: ProductionLine[] }> => {
    const { products, productionLines, onProductsFound, onProductionLinesFound } = this.props;
    
    const dropdownsData = { products, productionLines };

    if (!products) {
     const productsApi = await Api.getProductsService(keycloak);
     const foundProducts = await productsApi.listProducts();

     dropdownsData.products = foundProducts;
     onProductsFound(foundProducts);
    }

    if (!productionLines) {
     const productionLinesApi = await Api.getProductionLinesService(keycloak);
     const foundProductionLines = await productionLinesApi.listProductionLines();

     dropdownsData.productionLines = foundProductionLines;
     onProductionLinesFound(foundProductionLines);
    }

    return dropdownsData as { products: Product[], productionLines: ProductionLine[] };
  }

  /**
   * Deletes a packing
   */
  private handleDelete = async () => {
    const { keycloak, cutPackingId, onError } = this.props;
    if  (!keycloak) {
      return;
    }
    try {
      const cutPackingsApi = await Api.getCutPackingsService(keycloak);
      await cutPackingsApi.deletePacking(cutPackingId);

      this.setState({ redirect: true });

    } catch (e) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }

  }

  /**
   * Gets a display name for a packing name
   * 
   * @param productName the name of a product
   * @param cuttingDay the day on which a packing was cut
   */
  private getPackingName = () => {
    const { selectedProductName, cuttingDay } = this.state;
    return `${ selectedProductName } - ${ strings.cut } ${ cuttingDay }`
  }

  /**
   * Handles changing weight
   */
  private onWeightChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ weight: Number.parseInt(value) });
  }

  /**
   * Handles gutter count change
   */
  private onGutterCountChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ gutterCount: Number.parseInt(value) });
  }

  /**
   * Handles gutter hole count change
   */
  private onGutterHoleCountChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ gutterHoleCount: Number.parseInt(value) });
  }

  /**
   * Handles contact information change
   */
  private onContactInformationChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ contactInformation: value });
  }

  /**
   * Handles producer change
   */
  private onProducerChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ producer: value });
  }

  /**
   * Handles storage condition change
   */
  private onStorageConditionChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ storageCondition: value });
  }

  /**
   * Handles sowing day change
   */
  private onSowingDayChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ sowingDay: moment(value, "DD.MM.YYYY").toISOString() });
  }

  /**
   * Handles cutting day change
   */
  private onCuttingDayChange = async (e: any, { value }: InputOnChangeData) => {
    this.setState({ cuttingDay: moment(value, "DD.MM.YYYY").toISOString() });
  }


  /**
   * Updates cut packing
   */
  private updateCutPacking = async () => {
    const { keycloak, cutPackingId, onError } = this.props;
    const { weight, sowingDay, cuttingDay, gutterCount, gutterHoleCount, selectedProductId, selectedProductionLineId, producer, contactInformation, storageCondition } = this.state;

    if (!keycloak) {
      return;
    }

    try {
      const cutPackingsApi = await Api.getCutPackingsService(keycloak);
      await cutPackingsApi.updatePacking({ id: cutPackingId, weight, sowingDay, cuttingDay, gutterCount, gutterHoleCount, productId: selectedProductId!, productionLineId: selectedProductionLineId!, producer, contactInformation, storageCondition }, cutPackingId);
    
      this.setState({messageVisible: true});
      setTimeout(() => {
         this.setState({messageVisible: false});
       }, 3000);
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
    if (product) {
      productName = LocalizedUtils.getLocalizedValue(product.name) || "";
    }

    if (!product) {
      return;
    }

    this.setState({
      selectedProductName: productName,
      selectedProductId: product.id
    });
  }

     /**
    * @summary Handles updating printers
    */
   private onPrinterChange = (event: any, { value }: InputOnChangeData) => {
    this.setState({ selectedPrinter: this.state.printers.find(printer => printer.id == value)! });
  }

  /**
   * @summary prints a packing label
   */
  private print = async () => {
    const { keycloak, cutPackingId } = this.props;
    const { selectedPrinter } = this.state;
    if (!keycloak || !selectedPrinter) {
      return;
    }

    this.setState({ printing: true });
    const printingService = await Api.getPrintersService(keycloak);
    await printingService.print({ packingId: cutPackingId }, selectedPrinter.id);
    this.setState({ printing: false });
  }

  /**
   * @summary Refreshes the list of printers
   */
  private refreshPrinters = async () => {
    if (!this.props.keycloak) {
      return;
    }
    this.setState({ refreshingPrinters: true })
    const printingService = await Api.getPrintersService(this.props.keycloak);
    const printers = await printingService.listPrinters();
    this.setState({ printers, refreshingPrinters: false });
  }

  /**
   * Return production line options
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
   * Handles changing selected producion line
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

export default connect(mapStateToProps, mapDispatchToProps)(EditCutPacking);