import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { Product, PackageSize, ProductOpt, LocalizedEntry } from "famifarm-typescript-models";
import { Redirect } from 'react-router';
import strings from "../localization/strings";

import {
  Grid,
  Button,
  Form,
  InputOnChangeData
} from "semantic-ui-react";
import LocalizedUtils from "src/localization/localizedutils";
import LocalizedValueInput from "./LocalizedValueInput";

/**
 * Component props
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  packageSizes?: PackageSize[];
  onProductCreated?: (product: Product) => void;
  onPackageSizesFound?: (packageSizes: PackageSize[]) => void;
}

/**
 * Component state
 */
interface State {
  productData: ProductOpt,
  redirect: boolean;
}

class CreateProduct extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      redirect: false,
      productData: {}
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Component did mount life-sycle method
   */
  async componentDidMount() {
    if (!this.props.keycloak) {
      return;
    }

    const packageSizeService = await Api.getPackageSizesService(this.props.keycloak);
    packageSizeService.listPackageSizes().then((packageSizes) => {
      this.props.onPackageSizesFound && this.props.onPackageSizesFound(packageSizes);
    });
  }

  /**
   * Handle form submit
   */
  async handleSubmit() {
    if (!this.props.keycloak) {
      return;
    }

    const productObject: Product = {
      name: this.state.productData.name,
      defaultPackageSizeId: this.state.productData.defaultPackageSizeId
    };

    const productsService = await Api.getProductsService(this.props.keycloak);
    productsService.createProduct(productObject).then(() => {
      this.setState({redirect: true});
    });
  }

  /**
   * Handle default package size change
   * 
   * @param e event
   * @param {value} value
   */
  onUpdateDefaultPackageSize = (e: any, { value }: InputOnChangeData) => {
    this.setState({
      productData: {...this.state.productData, defaultPackageSizeId: value}
    });
}

  /**
   *  Updates performed cultivation action name
   * 
   * @param name localized entry representing name
   */
  updateName = (name: LocalizedEntry) => {
    this.setState({
      productData: {...this.state.productData, name: name}
    });
  }

  /**
   * Render product create view
   */
  render() {
    if (this.state.redirect) {
      return <Redirect to="/products" push={true} />;
    }

    const packageSizeOptions = (this.props.packageSizes || []).map((packageSize) => {
      return {
        key: packageSize.id,
        text: LocalizedUtils.getLocalizedValue(packageSize.name),
        value: packageSize.id
      };
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>{strings.newProduct}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <Form>
              <Form.Field required>
                <label>{strings.productName}</label>
                <LocalizedValueInput 
                  onValueChange={this.updateName}
                  value={this.state.productData.name}
                  languages={["fi", "en"]}
                />
              </Form.Field>
              <Form.Select 
                fluid 
                label={strings.packageSize} 
                options={packageSizeOptions} 
                placeholder={strings.packageSize} 
                onChange={this.onUpdateDefaultPackageSize}
              />
              <Button className="submit-button" onClick={this.handleSubmit} type='submit'>{strings.save} </Button>
            </Form>
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
export function mapStateToProps(state: StoreState) {
  return {
    products: state.products,
    product: state.product,
    packageSizes: state.packageSizes
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onProductCreated: (product: Product) => dispatch(actions.productCreated(product)),
    onPackageSizesFound: (packageSizes: PackageSize[]) => dispatch(actions.packageSizesFound(packageSizes))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateProduct);