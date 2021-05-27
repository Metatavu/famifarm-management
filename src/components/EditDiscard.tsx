import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { StoreState, ErrorMessage } from "src/types";
import * as actions from "../actions";
import { Packing, Product, PackageSize, PackingState, Printer, PackingType, Campaign, StorageDiscard } from "../generated/client";
import Api from "../api";
import { KeycloakInstance } from "keycloak-js";
import strings from "src/localization/strings";
import LocalizedUtils from "src/localization/localizedutils";
import { Grid, Button, Form, Select, Input, DropdownItemProps, DropdownProps, InputOnChangeData, Loader, Message, Confirm } from "semantic-ui-react";
import { FormContainer } from "./FormContainer";
import { DateInput } from 'semantic-ui-calendar-react';
import * as moment from "moment";
import { Redirect } from "react-router";

/**
 * Interface representing component properties
 */
export interface Props {
  keycloak: KeycloakInstance,
  onError: (error: ErrorMessage) => void;
  discardId: string;
}

/**
 * Interface representing component state
 */
export interface State {
  products: Product[],
  discard?: StorageDiscard;
  productName: string;
  date: Date,
  messageVisible: boolean;
  confirmOpen: boolean;
  redirect: boolean;
  discardCount: number;
  loading: boolean;
  packageSizes: PackageSize[];
  productId: string;
  product?: Product;
  packageSizeId?: string,
}

/**
 * React component for editing discarded product
 */
class EditDiscard extends React.Component<Props, State> {
  constructor(props:Props) {
    super(props);
    this.state = {
      products: [],
      productName: "",
      date : new Date(),
      messageVisible: false,
      confirmOpen: false,
      redirect: false,
      packageSizes: [],
      discardCount: 0,
      loading: false, 
      productId: "",
    }
}

  /**
   * component did mount lifecycle method
   */
  public async componentDidMount() {
    await this.fetchData()
  }
  
  public render() {
    const { loading, redirect, products, packageSizes, productId, packageSizeId, discardCount, date, messageVisible, discard} = this.state;

    if (loading) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }
    
    if (redirect) {
      return <Redirect to="/discards" push={ true } />;
    }
    
    const productOptions: DropdownItemProps[] = products.map((product) => {
      const id = product.id!;
      const name = LocalizedUtils.getLocalizedValue(product.name);

      return {
        key: id,
        value: id,
        text: name
      };
    });

    const packageSizeOptions: DropdownItemProps[] = packageSizes.map((size) => {
      const id = size.id!;
      const name = LocalizedUtils.getLocalizedValue(size.name);

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
              <h2>{strings.editDiscard}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{ strings.product }</label>
                <Select
                  options={ productOptions }
                  value={ productId }
                  onChange={ this.onPackingProductChange }
                />
              </Form.Field>
              <Form.Field required>
                <label>{ strings.packageSize }</label>
                <Select
                  options={ packageSizeOptions }
                  value={ packageSizeId }
                  onChange={ this.onPackageSizeChange }
                />
              </Form.Field>
              <Form.Field required>
              </Form.Field>
              <Form.Field>
                <label>{ strings.labelPackedCount }</label>
                <Input
                  type="number"
                  value={ discardCount }
                  onChange={ this.onDiscardCountChange }
                />
              </Form.Field>
              <Form.Field>
                <DateInput
                  dateFormat="DD.MM.YYYY"
                  onChange={ this.onChangeDate }
                  name="date"
                  value={ moment(date).format("DD.MM.YYYY") }
                />
              </Form.Field>
              <Message
                success
                visible={ messageVisible }
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
   * Returns a delete confirmation text
   */
     private getDeleteConfirmationText = (): string => {
      const { discard } = this.state;
      if (discard) {
        const productText = this.getProductName(discard) 

        return strings.deleteConfirmationText + productText + "?";
  
      }
      return strings.deleteConfirmationText + "?";
    }

  /**
   * Returns a discarded products name
   * 
   * @param discardedProduct discarded product 
   */
    private getProductName = (discardedProduct: StorageDiscard): string => {
      const { products } = this.state;
      const discard = (products || []).find(product => product.id == discardedProduct.productId);
    
      const productName = discard ? LocalizedUtils.getLocalizedValue(discard.name) : "";
    
      return productName;
    }
  

  /**
   * method for fetching data from api
   */
  private fetchData =  async () => {
    const { keycloak, discardId } = this.props;

    if(!keycloak) {
      return;
    }

    try {
      this.setState({ loading: true })

      const productsService = await Api.getProductsService(keycloak);
      const products = await productsService.listProducts({});

      const discardsService = await Api.getStorageDiscardsService(keycloak);
      const discard = await discardsService.getStorageDiscard({ storageDiscardId: discardId })
        
      const packageSizesSerivce = await Api.getPackageSizesService(keycloak);
      const packageSizes = await packageSizesSerivce.listPackageSizes({});

      const product = (products || []).find(product => product.id == discard.productId);
      const date = discard.discardDate || new Date();
      const discardCount = discard.discardAmount || 0;
      const packageSizeId = discard.packageSizeId;
      const productId = discard.productId;



      if(!productId || !product) {
        throw new Error("Product id undefined");
      }

      const productName = LocalizedUtils.getLocalizedValue(product.name);

      this.setState({
        products,
        discard,
        packageSizes,
        productName,
        date,
        discardCount,
        packageSizeId,
        loading: false,
        productId
      })
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Submits an updated discard
   */
     private handleSubmit = async () => {
      const { discard, productId, date, discardCount, packageSizeId } = this.state;
      const { keycloak } = this.props;
      try {
        const updatedDiscard = {
          id: discard ? discard.id : undefined,
          productId: productId,
          discardDate: date,
          discardAmount: discardCount,
          packageSizeId: packageSizeId,
        }
  
        if (!updatedDiscard.id) {
          throw new Error("Discard id is undefined.");
        }
  
        const discardService = await Api.getStorageDiscardsService(keycloak);
        await discardService.updateStorageDiscard({storageDiscardId: updatedDiscard.id, storageDiscard: updatedDiscard});
  
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
   * Deletes a discard
   */
  private handleDelete = async () => {
    const { discard } = this.state;
    const { keycloak } = this.props;
    try {
      const discardService = await Api.getStorageDiscardsService(keycloak);
      if (!discard) {
        throw new Error("Discard is undefined");
      }
  
      if (!discard.id) {
        throw new Error("Discard id is undefined")
      }

      await discardService.deleteStorageDiscard({ storageDiscardId: discard.id })

      this.setState({ redirect: true });

    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
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
    * Event handler for packed count change 
    */
    private onDiscardCountChange = (event: any, { value }: InputOnChangeData) => {
      const actualNumber = Number.parseInt(value) >= 0 ? Number.parseInt(value) : 0;
      this.setState({discardCount: actualNumber})
    }
  
    /**
    * Handles changing date
    */
     private onChangeDate = (e: any, { value }: InputOnChangeData) => {
      this.setState({date: moment(value, "DD.MM.YYYY HH:mm").toDate()});
    }
}
 
/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  
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

export default connect(mapStateToProps, mapDispatchToProps)(EditDiscard)
