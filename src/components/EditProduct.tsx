import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";import Api from "../api";
import { Product, PackageSize, LocalizedValue, HarvestEventType, Facility } from "../generated/client";
import { Navigate } from 'react-router-dom';
import strings from "../localization/strings";

import {
  Grid,
  Button,
  Loader,
  Form,
  Message,
  Confirm,
  CheckboxProps,
  DropdownProps,
  InputOnChangeData
} from "semantic-ui-react";
import LocalizedUtils from "../localization/localizedutils";
import LocalizedValueInput from "./LocalizedValueInput";
import { FormContainer } from "./FormContainer";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  productId: string;
  product?: Product;
  packageSizes?: PackageSize[];
  facility: Facility;
  onProductSelected?: (product: Product) => void;
  onProductDeleted?: (productId: string) => void;
  onPackageSizesFound?: (packageSizes: PackageSize[]) => void;
  onError: (error: ErrorMessage | undefined) => void;
}

/**
 * Interface representing component state
 */
interface State {
  product?: Product;
  redirect: boolean;
  saving: boolean;
  messageVisible: boolean;
  defaultPackageSizes: string[];
  open: boolean;
}

/**
 * React component for edit product view
 */
class EditProduct extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      product: undefined,
      redirect: false,
      saving: false,
      messageVisible: false,
      defaultPackageSizes: [],
      open:false
    };
  }

  /**
   * Component did mount life cycle method
   */
  public componentDidMount = async () => {
    const { keycloak, productId, facility, onPackageSizesFound, onProductSelected, onError } = this.props;

    if (!keycloak) {
      return;
    }

    try {
      const packageSizeService = await Api.getPackageSizesService(keycloak);
      const productsService = await Api.getProductsService(keycloak);
      const product = await productsService.findProduct({
        productId: productId,
        facility: facility
      });

      onProductSelected && onProductSelected(product);
      this.setState({ product });

      const packageSizes = await packageSizeService.listPackageSizes({ facility: facility });
      onPackageSizesFound && onPackageSizesFound(packageSizes);
    } catch (e: any) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Handle form submit
   */
  private handleSubmit = async () => {
    const { keycloak, facility, onError } = this.props;
    const { product } = this.state;
    try {
      if (!keycloak || !product) {
        return;
      }

      const productsService = await Api.getProductsService(keycloak);

      this.setState({ saving: true });
      await productsService.updateProduct({
        productId: product.id!,
        product: product,
        facility: facility
      });
      this.setState({ saving: false });

      this.setState({ messageVisible: true });
      setTimeout(() => {
        this.setState({ messageVisible: false });
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
   * Handle product delete
   */
  private handleDelete = async () => {
    const { keycloak, facility } = this.props;
    const { product } = this.state;
    if (!keycloak || !product) {
      return;
    }

    const productsService = await Api.getProductsService(keycloak);
    const productId = product.id || "";

    await productsService.deleteProduct({
      productId: productId,
      facility: facility
    });

    this.props.onProductDeleted && this.props.onProductDeleted(productId!);
    this.setState({ redirect: true });
  }


  /**
   *  Updates performed cultivation action name
   *
   * @param name localized entry representing name
   */
  private updateName = (name: LocalizedValue[]) => {
    this.setState({
      product: { ...this.state.product!, name }
    });
  }

  /**
   * Handle package size select change
   *
   * @param e event
   * @param value updated list of package sizes from DropdownProps
   */
  private onPackageSizeChange = (e: any, { value }: DropdownProps) => {
    this.setState({
      product: {
        ...this.state.product!,
        defaultPackageSizeIds: value as string[]
      }
    });
  }

  /**
   * Handle allowd harvest types event change
   *
   * @param e event
   * @param value updated list of package sizes from DropdownProps
   */
  private onAllowedHarvestTypesChange = (e: any, { value }: DropdownProps) => {
    this.setState({
      product: {
        ...this.state.product!,
        allowedHarvestTypes: value as HarvestEventType[]
      }
    });
  }

  /**
   * Handle sales weight event change
   *
   * @param e event
   * @param value sales weight
   */
  private onSalesWeightChange = (e: any, { value }: InputOnChangeData) => {
    this.setState({
      product: {
        ...this.state.product!,
        salesWeight: Number.parseFloat(value)
      }
    });
  }

  /**
   * Sets the isSubcontractorProduct boolean
   *
   * @param e event
   * @param checked checked state from CheckboxProps
   */
  private updateIsSubcontractorProduct = (e: any, { checked }: CheckboxProps) => {
    this.setState({
      product: {
        ...this.state.product,
        isSubcontractorProduct: checked || false
      }
    })
  }

  /**
   * Sets the isEndProduct boolean
   *
   * @param e event
   * @param checked checked state from CheckboxProps
   */
  private updateIsEndProduct = (e: any, { checked }: CheckboxProps) => {
    this.setState({
      product: {
        ...this.state.product!,
        isEndProduct: checked || false
      }
    })
  }

  /**
   * Sets the isRawMaterial boolean
   *
   * @param e event
   * @param checked checked state from CheckboxProps
   */
  private updateIsRawMaterial = (e: any, { checked }: CheckboxProps) => {
    this.setState({
      product: {
        ...this.state.product!,
        isRawMaterial: checked || false
      }
    })
  }


  /**
   * Sets the active boolean
   *
   * @param e event
   * @param { checked } new value
   */
  updateIsActive = (e: any, { checked }: CheckboxProps) => {
    this.setState({
      product: { ...this.state.product!, active: checked || false }
    })
  }

  /**
   * Render edit product view
   */
  public render() {
    const { packageSizes } = this.props;
    const { product, saving } = this.state;

    if (!this.props.product) {
      return (
        <Grid centered style={{ paddingTop: "100px" }}>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Navigate to="/products" replace={true}/>;
    }

    const packageSizeOptions = (packageSizes || []).map(packageSize => ({
      key: packageSize.id,
      text: LocalizedUtils.getLocalizedValue(packageSize.name),
      value: packageSize.id
    }));

    const allowedHarvestTypeOptions = [
      HarvestEventType.Bagging,
      HarvestEventType.Boxing,
      HarvestEventType.Cutting
    ].map(harvestType => {
      return {
        key: harvestType,
        value: harvestType,
        text: strings[`harvestType${harvestType}`]
      }
    });


    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={ 6 }>
            <h2>{ LocalizedUtils.getLocalizedValue(product ? product.name : undefined) }</h2>
          </Grid.Column>
          <Grid.Column width={ 3 } floated="right">
            <Button
              className="danger-button"
              onClick={ () => this.setState({ open: true }) }
            >
              { strings.delete }
            </Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={ 8 }>
            <FormContainer>
              <Form.Field required>
                <label>{ strings.productName }</label>
                <LocalizedValueInput
                  onValueChange={ this.updateName }
                  value={ product ? product.name : undefined }
                  languages={[ "fi", "en" ]}
                />
                <Form.Select
                  fluid
                  required
                  multiple
                  label={ strings.packageSize }
                  options={ packageSizeOptions }
                  placeholder={ strings.packageSize }
                  onChange={ this.onPackageSizeChange }
                  value={ product ? product.defaultPackageSizeIds || [] : [] }
                />
                <Form.Select
                  fluid
                  required
                  multiple
                  label={ strings.allowedHarvestTypes }
                  options={ allowedHarvestTypeOptions }
                  placeholder={ strings.labelHarvestType }
                  onChange={ this.onAllowedHarvestTypesChange }
                  value={ product ? product.allowedHarvestTypes || [] : [] }
                />
                <Form.Input
                  required
                  label={ strings.salesWeight }
                  name="salesWeight"
                  type="number"
                  value={ product ? product.salesWeight : 0 }
                  onChange={ this.onSalesWeightChange }
                />
              </Form.Field>
              <Form.Checkbox
                required
                onChange={ this.updateIsSubcontractorProduct }
                checked={ product ? product.isSubcontractorProduct : undefined }
                label={ strings.subcontractorProduct }
              />
              <Form.Checkbox
                required
                checked={ this.state.product ? this.state.product.active : undefined }
                onChange={ this.updateIsActive }
                label={ strings.activeProductLabel }
              />
              <Form.Checkbox
                required
                checked={ this.state.product ? this.state.product.isEndProduct : undefined }
                onChange={ this.updateIsEndProduct }
                label={ strings.isEndProduct }
              />
              <Form.Checkbox
                required
                checked={ this.state.product ? this.state.product.isRawMaterial : undefined }
                onChange={ this.updateIsRawMaterial }
                label={ strings.isRawMaterial }
              />
              <Message
                success
                visible={ this.state.messageVisible }
                header={ strings.savedSuccessfully }
              />
              <Button
                className="submit-button"
                onClick={ this.handleSubmit }
                type='submit'
                loading={ saving }
              >
                { strings.save }
              </Button>
            </FormContainer>
          </Grid.Column>
        </Grid.Row>
        <Confirm
          open={ this.state.open }
          size="mini"
          content={ this.props.product.name ? `${strings.deleteConfirmationText}${this.props.product.name[0].value}` : "" }
          onCancel={ () => this.setState({ open:false }) }
          onConfirm={ this.handleDelete }
        />
      </Grid>
    );
  }
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
const mapStateToProps = (state: StoreState) => ({
  products: state.products,
  product: state.product,
  packageSizes: state.packageSizes,
  facility: state.facility
});

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
const mapDispatchToProps = (dispatch: Dispatch<actions.AppAction>) => ({
  onProductSelected: (product: Product) => dispatch(actions.productSelected(product)),
  onProductDeleted: (productId: string) => dispatch(actions.productDeleted(productId)),
  onPackageSizesFound: (packageSizes: PackageSize[]) => dispatch(actions.packageSizesFound(packageSizes)),
  onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
});

export default connect(mapStateToProps, mapDispatchToProps)(EditProduct);
