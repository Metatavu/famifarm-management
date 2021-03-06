import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { Product, PackageSize, LocalizedValue } from "../generated/client";
import { Redirect } from 'react-router';
import strings from "../localization/strings";

import {
  Grid,
  Button,
  Form,
  CheckboxProps,
  DropdownProps
} from "semantic-ui-react";
import LocalizedUtils from "src/localization/localizedutils";
import LocalizedValueInput from "./LocalizedValueInput";
import { FormContainer } from "./FormContainer";

/**
 * Component props
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  packageSizes?: PackageSize[];
  onProductCreated?: (product: Product) => void;
  onPackageSizesFound?: (packageSizes: PackageSize[]) => void,
  onError: (error: ErrorMessage) => void
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
        active: true
      }
    };
  }

  /**
   * Component did mount life cycle method
   */
  public componentDidMount = async () => {
    try {
      if (!this.props.keycloak) {
        return;
      }

      const packageSizeService = await Api.getPackageSizesService(this.props.keycloak);
      const packageSizes = await packageSizeService.listPackageSizes({});
      this.props.onPackageSizesFound && this.props.onPackageSizesFound(packageSizes);
    } catch (e) {
      this.props.onError({
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
    const { keycloak } = this.props;

    if (!keycloak) {
      return;
    }

    try {  
      const productsService = await Api.getProductsService(keycloak);  
      await productsService.createProduct({
        product: {
          name: this.state.productData.name,
          defaultPackageSizeIds: this.state.productData.defaultPackageSizeIds,
          isSubcontractorProduct: this.state.productData.isSubcontractorProduct!,
          active: this.state.productData.active
        }
      });
  
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
    const { redirect, productData } = this.state;

    if (redirect) {
      return <Redirect push to="/products"/>;
    }

    const packageSizeOptions = (packageSizes || []).map(packageSize => ({
      key: packageSize.id,
      text: LocalizedUtils.getLocalizedValue(packageSize.name),
      value: packageSize.id
    }));

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
  packageSizes: state.packageSizes
});

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
const mapDispatchToProps = (dispatch: Dispatch<actions.AppAction>) => ({
  onProductCreated: (product: Product) => dispatch(actions.productCreated(product)),
  onPackageSizesFound: (packageSizes: PackageSize[]) => dispatch(actions.packageSizesFound(packageSizes)),
  onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateProduct);