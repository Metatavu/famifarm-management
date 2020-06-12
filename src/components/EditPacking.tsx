import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { StoreState, ErrorMessage } from "src/types";
import * as actions from "../actions";
import { Packing, Product, PackageSize, PackingState, Printer } from "famifarm-typescript-models";
import Api from "../api";
import { KeycloakInstance } from "keycloak-js";
import strings from "src/localization/strings";
import LocalizedUtils from "src/localization/localizedutils";
import { Grid, Button, Form, Select, Input, DropdownItemProps, DropdownProps, InputOnChangeData, Loader, Message, Confirm } from "semantic-ui-react";
import { FormContainer } from "./FormContainer";
import { DateInput } from 'semantic-ui-calendar-react';
import * as moment from "moment";
import { Redirect } from "react-router";

export interface Props {
  keycloak: KeycloakInstance,
  packingId: string,
  onError: (error: ErrorMessage) => void
}

export interface State {
  packing?: Packing,
  productName: string,
  productId: string,
  products: Product[],
  packageSizes: PackageSize[],
  packageSizeId?: string,
  packingStatus: PackingState,
  packedCount: number,
  loading: boolean,
  date: string,
  messageVisible: boolean,
  confirmOpen: boolean,
  redirect: boolean,
  printers: Printer[],
  printing: boolean,
  selectedPrinter?: Printer,
  refreshingPrinters: boolean
}

class EditPacking extends React.Component<Props, State> {
  constructor(props:Props) {
    super(props);
    this.state = {
      productName : "",
      productId : "",
      products : [],
      packageSizes : [],
      packingStatus : "IN_STORE" as PackingState,
      packedCount : 0,
      loading : false,
      date : moment(moment(), "DD.MM.YYYY HH:mm").toISOString(),
      messageVisible : false,
      confirmOpen: false,
      redirect: false,
      printers: [],
      printing: false,
      refreshingPrinters: false
    }
    this.handleSubmit = this.handleSubmit.bind(this);
}

  public async componentDidMount() {
    try {
      if (!this.props.keycloak) {
        return;
      }
      this.setState({loading: true});

      const packingsService = await Api.getPackingsService(this.props.keycloak);
      const packing = await packingsService.findPacking(this.props.packingId);
      const packingStatus = packing.state;
      const date = packing.time;
      const packedCount = packing.packedCount || 0;

      await this.refreshPrinters();
      
      const productsService = await Api.getProductsService(this.props.keycloak);
      const product = await productsService.findProduct(packing.productId);
      const products = await productsService.listProducts();

      const productId = product.id;

      if (!productId) {
        throw new Error("Product id undefined");
      }

      const productName = LocalizedUtils.getLocalizedValue( product.name);

      const packageSizesSerivce = await Api.getPackageSizesService(this.props.keycloak);
      const packageSizes = await packageSizesSerivce.listPackageSizes();

      if (!packing) {
        throw new Error("Could not find packing");
      }

      this.setState({packing, productName, productId, products, packageSizes, packingStatus, date, packedCount, packageSizeId: packing.packageSizeId, loading: false});

    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }
  
  public render() {
    if (this.state.loading) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }
    
    if (this.state.redirect) {
      return <Redirect to="/packings" push={true} />;
    }
    
    const productOptions: DropdownItemProps[] = [{ key: "", value: "", text: "", }].concat(this.state.products.map((product) => {
      const id = product.id!;
      const name = LocalizedUtils.getLocalizedValue(product.name);

      return {
        key: id,
        value: id,
        text: name
      };
    }));

    const packageSizeOptions: DropdownItemProps[] = [{ key: "", value: "", text: "", }].concat(this.state.packageSizes.map((size) => {
      const id = size.id!;
      const name = LocalizedUtils.getLocalizedValue(size.name);

      return {
        key: id,
        value: id,
        text: name
      };
    }));

    const printers = (this.state.printers).map((printer, i) => {
      return { text: printer.name, value: printer.id };
    });
    
    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
        <Grid.Column width={8}>
            <h2>{strings.editPacking}</h2>
        </Grid.Column>
        </Grid.Row>
        <Grid.Row>
            <Grid.Column width={8}>
                <FormContainer>
                    <Form.Field required>
                        <label>{strings.product}</label>
                        <Select options={ productOptions } value={ this.state.productId } onChange={ this.onPackingProductChange }></Select>
                    </Form.Field>
                    <Form.Field required>
                        <label>{strings.packageSize}</label>
                        <Select options={ packageSizeOptions } value={ this.state.packageSizeId } onChange={ this.onPackageSizeChange }></Select>
                    </Form.Field>
                    <Form.Field required>
                        <label>{strings.packingStatus}</label>
                        <Select options={ [{value:"IN_STORE", text: strings.packingStoreStatus}, {value: "REMOVED", text: strings.packingRemovedStatus}] } text={this.state.packingStatus ? this.resolveStatusLocalizedName() : strings.selectPackingStatus} value={ this.state.packingStatus } onChange={ this.onStatusChange }></Select>
                    </Form.Field>
                    <Form.Field>
                        <label>{strings.labelPackedCount}</label>
                        <Input type="number" value={ this.state.packedCount} onChange={ this.onPackedCountChange }></Input>
                    </Form.Field>
                    <Form.Field>
                        <DateInput dateFormat="DD.MM.YYYY" onChange={this.onChangeDate} name="date" value={ moment(this.state.date).format("DD.MM.YYYY") } />
                    </Form.Field>
                    <Message
                      success
                      visible={this.state.messageVisible}
                      header={strings.savedSuccessfully}
                    />
                    <Button className="submit-button" onClick={this.handleSubmit} type='submit'>{strings.save}</Button>
                    <Button className="danger-button" onClick={() => this.setState({confirmOpen:true})}>{strings.delete}</Button>
                </FormContainer>
            </Grid.Column>
        </Grid.Row>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
              <h2>{strings.printPacking}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <Select options={ printers } text={ this.state.selectedPrinter ? this.state.selectedPrinter.name : strings.selectPrinter } value={ this.state.selectedPrinter ? this.state.selectedPrinter.id : undefined } onChange={ this.onPrinterChange }></Select>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Button disabled={ this.state.printing } loading={ this.state.printing } className="submit-button" onClick={ this.print } type='submit'>{ strings.print }</Button>
          <Button loading={ this.state.refreshingPrinters } className="submit-button" onClick={ this.refreshPrinters } type='submit'>{ strings.update }</Button>
        </Grid.Row>
        <Confirm open={this.state.confirmOpen} size={"mini"} content={strings.deleteConfirmationText + this.state.productName + " - "+ this.state.date} onCancel={()=>this.setState({confirmOpen:false})} onConfirm={this.handleDelete} />
      </Grid>
    )
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
    if (!this.props.keycloak || !this.state.packing || !this.state.packing.id || !this.state.selectedPrinter) {
      return;
    }

    this.setState({ printing: true });
    const printingService = await Api.getPrintersService(this.props.keycloak);
    await printingService.print({ packingId: this.state.packing.id }, this.state.selectedPrinter.id);
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
    * Resolves localized name of the packing status
    */
  private resolveStatusLocalizedName = () => {
    return this.state.packingStatus === "IN_STORE" ? strings.packingStoreStatus : strings.packingRemovedStatus;
  }

  /**
    * Event handler for product change 
    */
  private onPackingProductChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
    this.setState({
      productId: data.value as string
    });
  }

  /**
    * Event handler for product change 
    */
   private onPackageSizeChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
    this.setState({
      packageSizeId: data.value as string
    });
  }

  /**
    * Event handler for packing status
    */
  private onStatusChange = (event: any, { value }: InputOnChangeData) => {
    this.setState({packingStatus: value as PackingState})
  }

  /**
    * Event handler for packed count change 
    */
  private onPackedCountChange = (event: any, { value }: InputOnChangeData) => {
    const actualNumber = Number.parseInt(value) >= 0 ? Number.parseInt(value) : 0;
    this.setState({packedCount: actualNumber})
  }

  /**
    * Handles changing date
    */
    private onChangeDate = (e: any, { value }: InputOnChangeData) => {
      this.setState({date: moment(value, "DD.MM.YYYY HH:mm").toISOString()});
  }

  /**
   * Submits an updated packing
   */
  private handleSubmit = async () => {
    try {
      const updatedPacking: Packing  = {
        id : this.state.packing ? this.state.packing.id : undefined,
        productId: this.state.productId,
        time: this.state.date,
        packedCount: this.state.packedCount,
        packageSizeId: this.state.packageSizeId,
        state: this.state.packingStatus
      }

      if (!updatedPacking.id) {
        throw new Error("Packing id is undefined.");
      }

      const packingsService = await Api.getPackingsService(this.props.keycloak);
      await packingsService.updatePacking(updatedPacking, updatedPacking.id);

      this.setState({messageVisible: true});
      setTimeout(() => {
        this.setState({messageVisible: false});
      }, 3000);
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }

  } 
  
  /**
   * Deletes a packing
   */
  private handleDelete = async () => {
    try {
      const packingsService = await Api.getPackingsService(this.props.keycloak);
      if (!this.state.packing) {
        throw new Error("Packing is undefined");
      }
  
      if (!this.state.packing.id) {
        throw new Error("Packing id is undefined")
      }

      await packingsService.deletePacking(this.state.packing.id);

      this.setState({redirect: true});

    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }

  }
}
 
/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
    return {

    };
}
  
/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };  
};

export default connect(mapStateToProps, mapDispatchToProps)(EditPacking)