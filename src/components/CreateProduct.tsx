import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { Product, PackageSize, LocalizedValue, HarvestEventType, Facility } from "../generated/client";
import { Navigate } from 'react-router-dom';
import strings from "../localization/strings";

import {
  Grid,
  Button,
  Form,
  CheckboxProps,
  DropdownProps,
  InputOnChangeData
} from "semantic-ui-react";
import LocalizedUtils from "../localization/localizedutils";
import LocalizedValueInput from "./LocalizedValueInput";
import { FormContainer } from "./FormContainer";

/**
 * Component props
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  packageSizes?: PackageSize[];
  facility: Facility;
  onProductCreated?: (product: Product) => void;
  onPackageSizesFound?: (packageSizes: PackageSize[]) => void;
  onError: (error: ErrorMessage | undefined) => void;
}

/**
 * Component state
 */
interface State {
  productData: Product,
  redirect: boolean;
}

/**
 * Create product screen
 */
class CreateProduct extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      redirect: false,
      productData: {
        isSubcontractorProduct: false,
        active: true,
        isEndProduct: false,
        isRawMaterial: false,
        salesWeight: 0
      }
    };
  }

  /**
   * Component did mount life cycle method
   */
  public componentDidMount = async () => {
    const { keycloak, facility, onError, onPackageSizesFound } = this.props;
    try {
      if (!keycloak) {
        return;
      }

      const packageSizeService = await Api.getPackageSizesService(keycloak);
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
    const { keycloak, facility } = this.props;
    const { productData } = this.state;

    if (!keycloak) {
      return;
    }

    try {
      const productsService = await Api.getProductsService(keycloak);
      await productsService.createProduct({
        facility: facility,
        product: {
          name: productData.name,
          defaultPackageSizeIds: productData.defaultPackageSizeIds,
          isSubcontractorProduct: productData.isSubcontractorProduct!,
          active: productData.active,
          isEndProduct: productData.isEndProduct,
          isRawMaterial: productData.isRawMaterial,
          salesWeight: productData.salesWeight
        }
      });

      this.setState({ redirect: true });
    } catch (e: any) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Handle default package size change
   *
   * @param e event
   * @param value updated list of package sizes from DropdownProps
   */
  private onUpdateDefaultPackageSize = (e: any, { value }: DropdownProps) => {
    this.setState({
      productData: {
        ...this.state.productData,
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
      productData: {
        ...this.state.productData,
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
      productData: {
        ...this.state.productData,
        salesWeight: Number.parseFloat(value)
      }
    });
  }

  /**
   *  Updates performed cultivation action name
   *
   * @param name localized entry representing name
   */
  private updateName = (name: LocalizedValue[]) => {
    this.setState({
      productData: {...this.state.productData, name }
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
      productData: {
        ...this.state.productData,
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
      productData: {
        ...this.state.productData,
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
      productData: {
        ...this.state.productData,
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
      productData: { ...this.state.productData, active: checked || false }
    })
  }

  /**
   * Render product create view
   */
  public render = () => {
    const { packageSizes } = this.props;
    const { productData } = this.state;

    if (this.state.redirect) {
      return <Navigate replace={true} to="/products"/>;
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
          <Grid.Column width={ 8 }>
            <h2>{ strings.newProduct }</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={ 8 }>
            <FormContainer>
              <Form.Field required>
                <label>{ strings.productName }</label>
                <LocalizedValueInput
                  onValueChange={ this.updateName }
                  value={ productData.name }
                  languages={[ "fi", "en" ]}
                />
              </Form.Field>
              <Form.Select
                fluid
                required
                multiple
                label={ strings.packageSize }
                options={ packageSizeOptions }
                placeholder={ strings.packageSize }
                value={ productData.defaultPackageSizeIds || [] }
                onChange={ this.onUpdateDefaultPackageSize }
              />
              <Form.Select
                fluid
                required
                multiple
                label={ strings.allowedHarvestTypes }
                options={ allowedHarvestTypeOptions }
                placeholder={ strings.labelHarvestType }
                onChange={ this.onAllowedHarvestTypesChange }
                value={ productData ? productData.allowedHarvestTypes || [] : [] }
              />
              <Form.Input
                required
                label={ strings.salesWeight }
                name="salesWeight"
                type="number"
                value={ productData.salesWeight }
                onChange={ this.onSalesWeightChange }
              />
              <Form.Checkbox
                required
                checked={ productData.isSubcontractorProduct }
                onChange={ this.updateIsSubcontractorProduct }
                label={ strings.subcontractorProduct }
              />
              <Form.Checkbox
                required
                checked={ this.state.productData.active }
                onChange={ this.updateIsActive }
                label={ strings.activeProductLabel }
              />
              <Form.Checkbox
                required
                checked={ this.state.productData.isEndProduct }
                onChange={ this.updateIsEndProduct }
                label={ strings.isEndProduct }
              />
              <Form.Checkbox
                required
                checked={ this.state.productData.isRawMaterial }
                onChange={ this.updateIsRawMaterial }
                label={ strings.isRawMaterial }
              />
              <Button
                className="submit-button"
                onClick={ this.handleSubmit }
                type="submit"
              >
                { strings.save }
              </Button>
            </FormContainer>
          </Grid.Column>
        </Grid.Row>
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
  onProductCreated: (product: Product) => dispatch(actions.productCreated(product)),
  onPackageSizesFound: (packageSizes: PackageSize[]) => dispatch(actions.packageSizesFound(packageSizes)),
  onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateProduct);