import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { StoreState, ErrorMessage } from "../types";
import * as actions from "../actions";
import { Packing, Product, PackageSize, PackingState, Printer, PackingType, Campaign, Facility } from "../generated/client";
import Api from "../api";
import { KeycloakInstance } from "keycloak-js";
import strings from "../localization/strings";
import LocalizedUtils from "../localization/localizedutils";
import { Grid, Button, Form, Select, Input, DropdownItemProps, DropdownProps, Loader, Message, Confirm, InputOnChangeData } from "semantic-ui-react";
import { FormContainer } from "./FormContainer";
import { DateTimeInput } from 'semantic-ui-calendar-react';
import moment from "moment";
import { Navigate } from "react-router-dom";

export interface Props {
  keycloak: KeycloakInstance;
  packingId: string;
  facility: Facility;
  onError: (error: ErrorMessage | undefined) => void;
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
  date: Date,
  messageVisible: boolean,
  confirmOpen: boolean,
  redirect: boolean,
  printers: Printer[],
  printing: boolean,
  selectedPrinter?: Printer,
  refreshingPrinters: boolean,
  campaignId?: string,
  packingType?: PackingType,
  campaigns: Campaign[],
  campaignName?: string
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
      date : new Date(),
      messageVisible : false,
      confirmOpen: false,
      redirect: false,
      printers: [],
      printing: false,
      refreshingPrinters: false,
      campaigns: []
    }
    this.handleSubmit = this.handleSubmit.bind(this);
}

  public async componentDidMount() {
    const { keycloak, packingId, facility } = this.props;
    try {
      if (!keycloak) {
        return;
      }
      this.setState({loading: true});

      const packingsService = await Api.getPackingsService(keycloak);
      const packing = await packingsService.findPacking({
        packingId: packingId,
        facility: facility
      });

      const productsService = await Api.getProductsService(keycloak);
      const products = await productsService.listProducts({ facility: facility });

      const campaignsService = await Api.getCampaignsService(keycloak);
      const campaigns = await campaignsService.listCampaigns({ facility: facility });

      const packingStatus = packing.state;
      const date = packing.time;

      if (!packing) {
        throw new Error("Could not find packing");
      }

      if (packing.type == "BASIC") {
        const product = await productsService.findProduct({
          productId: packing.productId!,
          facility: facility
        });
        const packedCount = packing.packedCount || 0;
  
        await this.refreshPrinters();
        
        const productId = product.id;
  
        if (!productId) {
          throw new Error("Product id undefined");
        }
  
        const productName = LocalizedUtils.getLocalizedValue(product.name);
  
        const packageSizesSerivce = await Api.getPackageSizesService(keycloak);
        const packageSizes = await packageSizesSerivce.listPackageSizes({ facility: facility });
  
        this.setState({
          packing,
          productName,
          productId,
          products,
          packageSizes,
          packingStatus,
          date,
          packedCount,
          packageSizeId: packing.packageSizeId,
          loading: false,
          campaigns,
          packingType: PackingType.Basic
        });
      }

      if (packing.type == "CAMPAIGN") {
        const campaign = await campaignsService.findCampaign({
          campaignId: packing.campaignId!,
          facility: facility
        });
        const { name, id } = campaign;

        this.setState({
          packing,
          products,
          campaigns,
          date,
          packingStatus,
          campaignName: name,
          campaignId: id,
          loading: false,
          packingType: PackingType.Campaign
        });
      }


    } catch (e: any) {
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
      return <Navigate replace={true} to="/packings"/>;
    }
    
    const productOptions: DropdownItemProps[] = this.state.products.map((product) => {
      const id = product.id!;
      const name = LocalizedUtils.getLocalizedValue(product.name);

      return {
        key: id,
        value: id,
        text: name
      };
    });

    const packageSizeOptions: DropdownItemProps[] = this.state.packageSizes.map((size) => {
      const id = size.id!;
      const name = LocalizedUtils.getLocalizedValue(size.name);

      return {
        key: id,
        value: id,
        text: name
      };
    });

    const printers = (this.state.printers).map((printer, i) => {
      return { text: printer.name, value: printer.id };
    });

    const campaignOptions = this.state.campaigns.map((campaign) => {
      const id = campaign.id!;
      const name = campaign.name;

      return {
        key: id,
        value: id,
        text: name
      };
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
            {
              this.state.packingType == "BASIC" && 
              <FormContainer>
                <Form.Field required>
                  <label>{ strings.product }</label>
                  <Select
                    options={ productOptions }
                    value={ this.state.productId }
                    onChange={ this.onPackingProductChange }
                  />
                </Form.Field>
                <Form.Field required>
                  <label>{ strings.packageSize }</label>
                  <Select
                    options={ packageSizeOptions }
                    value={ this.state.packageSizeId }
                    onChange={ this.onPackageSizeChange }
                  />
                </Form.Field>
                <Form.Field required>
                  <label>{ strings.packingStatus }</label>
                  <Select
                    options={[
                      { value:"IN_STORE", text: strings.packingStoreStatus },
                      { value: "REMOVED", text: strings.packingRemovedStatus },
                      { value: "WASTAGE", text: strings.packingWastageStatus }
                    ]}
                    text={ this.state.packingStatus ? this.resolveStatusLocalizedName() : strings.selectPackingStatus }
                    value={ this.state.packingStatus }
                    onChange={ this.onStatusChange }
                  />
                </Form.Field>
                <Form.Field>
                  <label>{ strings.labelPackedCount }</label>
                  <Input
                    type="number"
                    value={ this.state.packedCount }
                    onChange={ this.onPackedCountChange }
                  />
                </Form.Field>
                <Form.Field>
                  <DateTimeInput
                    dateFormat="DD.MM.YYYY HH:mm"
                    onChange={ this.onChangeDate }
                    name="date"
                    value={ moment(this.state.date).format("DD.MM.YYYY HH:mm") }
                  />
                </Form.Field>
                <Message
                  success
                  visible={ this.state.messageVisible }
                  header={ strings.savedSuccessfully }
                />
                <Button
                  className="submit-button"
                  onClick={ this.handleSubmit }
                  type='submit'
                >
                  { strings.save }
                </Button>
                <Button
                  className="danger-button"
                  onClick={ () => this.setState({ confirmOpen: true }) }
                >
                  { strings.delete }
                </Button>
              </FormContainer>
            }
                
            {
              this.state.packingType == "CAMPAIGN" &&
              <FormContainer>
                <Form.Field required>
                  <label>{ strings.campaign }</label>
                  <Select
                    options={ campaignOptions }
                    value={ this.state.campaignId }
                    onChange={ this.onPackingCampaignChange }
                  />
                </Form.Field>
                <Form.Field required>
                  <label>{ strings.packingStatus }</label>
                  <Select
                    options={[
                      { value:"IN_STORE", text: strings.packingStoreStatus },
                      { value: "REMOVED", text: strings.packingRemovedStatus },
                      { value: "WASTAGE", text: strings.packingWastageStatus }
                    ]}
                    text={ this.state.packingStatus ? this.resolveStatusLocalizedName() : strings.selectPackingStatus }
                    value={ this.state.packingStatus }
                    onChange={ this.onStatusChange }
                  />
                </Form.Field>
                <Form.Field>
                  <DateTimeInput
                    dateFormat="DD.MM.YYYY HH:mm"
                    onChange={ this.onChangeDate }
                    name="date"
                    value={ moment(this.state.date).format("DD.MM.YYYY HH:mm") }
                  />
                </Form.Field>
                <Message
                  success
                  visible={ this.state.messageVisible }
                  header={ strings.savedSuccessfully }
                />
                <Button
                  className="submit-button"
                  onClick={ this.handleSubmit }
                  type='submit'
                >
                  { strings.save }
                </Button>
                <Button
                  className="danger-button"
                  onClick={ () => this.setState({ confirmOpen: true }) }
                >
                  { strings.delete }
                </Button>
              </FormContainer>
            }
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
            options={ printers }
            text={ this.state.selectedPrinter ? this.state.selectedPrinter.name : strings.selectPrinter }
            value={ this.state.selectedPrinter ? this.state.selectedPrinter.id : undefined }
            onChange={ this.onPrinterChange }
          />
            <Button style={{ marginLeft: 10 }} loading={ this.state.refreshingPrinters } className="submit-button" onClick={ this.refreshPrinters } type='submit'>{ strings.update }</Button>
          </Grid.Column>
        </Grid.Row>


        <Grid.Row>
          <Grid.Column width={8}>
            <Button disabled={ this.state.printing } loading={ this.state.printing } className="submit-button" onClick={ this.print } type='submit'>{ strings.print }</Button>
          </Grid.Column>
        </Grid.Row>

        <Confirm
          open={ this.state.confirmOpen }
          size="mini"
          content={ this.getDeleteConfirmationText() }
          onCancel={ () => this.setState({ confirmOpen : false }) }
          onConfirm={ this.handleDelete }
        />
      </Grid>
    )
  }

  /**
   * Returns a delete confiramtion text
   */
  private getDeleteConfirmationText = (): string => {
    if (this.state.packing) {
      const packingText = this.state.packing.type == "BASIC" ?
        this.getPackingName(this.state.packing) :
        this.getCampaignPackingName(this.state.packing);

      return strings.deleteConfirmationText + packingText + "?";

    }
    return strings.deleteConfirmationText + "?";
  }

  /**
   * Returns a text for a basic packing list entry
   * 
   * @param packing packing 
   */
  private getPackingName = (packing: Packing): string => {
    const products = this.state.products;
    const packingProduct = products.find((product) => product.id === packing.productId);
    const productName = packingProduct ? LocalizedUtils.getLocalizedValue(packingProduct.name) : packing.id;
    const packingDate = moment(packing.time).format("DD.MM.YYYY");

    return `${productName} - ${packingDate}`;
  }

  /**
   * Returns a text for a campaign packing list entry
   * 
   * @param packing packing
   */
  private getCampaignPackingName = (packing: Packing): string => {
    const campaigns = this.state.campaigns;
    const packingCampaign = campaigns.find((campaign) => campaign.id === packing.campaignId)
    const campaignName = packingCampaign ? packingCampaign.name : packing.id;
    const packingDate = moment(packing.time).format("DD.MM.YYYY");
    
    return `${campaignName} - ${packingDate}`;
  }

  /**
   * Event handler for campaign change
   *
   * @param event React change event
   * @param data dropdown data
   */
  private onPackingCampaignChange = (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
    this.setState({
      campaignId: data.value as string
    });
  }

   /**
    * @summary Handles updating printers
    */
   private onPrinterChange = (event: any, { value }: DropdownProps) => {
    this.setState({ selectedPrinter: this.state.printers.find(printer => printer.id == value)! });
  }

  /**
   * @summary prints a packing label
   */
  private print = async () => {
    const { packing, selectedPrinter } = this.state;
    const { keycloak, facility } = this.props;
    if (!keycloak || !packing || !packing.id || !selectedPrinter) {
      return;
    }

    this.setState({ printing: true });
    const printingService = await Api.getPrintersService(this.props.keycloak);
    await printingService.print({
      printerId: selectedPrinter.id,
      printData: { packingId: packing.id },
      facility: facility
    });
    this.setState({ printing: false });
  }

  /**
   * @summary Refreshes the list of printers
   */
  private refreshPrinters = async () => {
    const { keycloak, facility } = this.props;
    if (!keycloak) {
      return;
    }
    this.setState({ refreshingPrinters: true })
    const printingService = await Api.getPrintersService(keycloak);
    const printers = await printingService.listPrinters({ facility: facility });
    this.setState({ printers, refreshingPrinters: false });
  }

  /**
    * Resolves localized name of the packing status
    */
  private resolveStatusLocalizedName = () => {
    switch(this.state.packingStatus) {
      case "IN_STORE":
        return strings.packingStoreStatus
      case "REMOVED":
        return strings.packingRemovedStatus
      case "WASTAGE":
        return strings.packingWastageStatus;
      default:
        return "";
    }
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
  private onStatusChange = (event: any, { value }: DropdownProps) => {
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
    private onChangeDate = (e: any, { value }: DropdownProps) => {
      this.setState({date: moment(value as any, "DD.MM.YYYY HH:mm").toDate()});
  }

  /**
   * Submits an updated packing
   */
  private handleSubmit = async () => {
    const { keycloak, facility, onError } = this.props;
    const { packing, productId, campaignId, packageSizeId, packedCount, packingStatus, date, packingType } = this.state;
    try {
      const type = packingType;

      if (type == "BASIC" && !productId) {
        return;
      }

      if (type == "CAMPAIGN" && !campaignId) {
        return;
      }

      if (!type) {
        return;
      }

      const updatedPacking = type == "CAMPAIGN" ? {
        type,
        id: packing ? packing.id : undefined,
        campaignId: campaignId,
        state: packingStatus,
        time: date
      } : {
        id: packing ? packing.id : undefined,
        productId: productId,
        time: date,
        packedCount: packedCount,
        packageSizeId: packageSizeId,
        state: packingStatus,
        type
      }

      if (!updatedPacking.id) {
        throw new Error("Packing id is undefined.");
      }

      const packingsService = await Api.getPackingsService(keycloak);
      await packingsService.updatePacking({
        packingId: updatedPacking.id,
        packing: updatedPacking,
        facility: facility
      });

      this.setState({messageVisible: true});
      setTimeout(() => {
        this.setState({messageVisible: false});
      }, 3000);
    } catch (e: any) {
      onError({
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
    const { keycloak, facility, onError } = this.props;
    const { packing } = this.state;
    try {
      const packingsService = await Api.getPackingsService(keycloak);
      if (!packing) {
        throw new Error("Packing is undefined");
      }
  
      if (!packing.id) {
        throw new Error("Packing id is undefined")
      }

      await packingsService.deletePacking({
        packingId: packing.id,
        facility: facility
      });

      this.setState({redirect: true});

    } catch (e: any) {
      onError({
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
      facility: state.facility
    };
}
  
/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
     onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };  
};

export default connect(mapStateToProps, mapDispatchToProps)(EditPacking)
