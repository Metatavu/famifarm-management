import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";import Api from "../api";
import { Product, PackageSize, LocalizedEntry } from "famifarm-typescript-models";
import { Redirect } from 'react-router';
import strings from "src/localization/strings";

import {
  Grid,
  Button,
  Loader,
  Form,
  Message,
  InputOnChangeData,
  Confirm
} from "semantic-ui-react";
import LocalizedUtils from "src/localization/localizedutils";
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
  onProductSelected?: (product: Product) => void;
  onProductDeleted?: (productId: string) => void;
  onPackageSizesFound?: (packageSizes: PackageSize[]) => void,
  onError: (error: ErrorMessage) => void
}

/**
 * Interface representing component state
 */
interface State {
  product?: Product;
  redirect: boolean;
  saving: boolean;
  messageVisible: boolean;
  defaultPackageSize: string;
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
      defaultPackageSize: "",
      open:false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handeNameChange = this.handeNameChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  /**
   * Component did mount life-sycle method
   */
  public async componentDidMount() {
    try {
      if (!this.props.keycloak) {
        return;
      }
  
      const packageSizeService = await Api.getPackageSizesService(this.props.keycloak);
      const productsService = await Api.getProductsService(this.props.keycloak);
      const product = await productsService.findProduct(this.props.productId);
  
      this.props.onProductSelected && this.props.onProductSelected(product);
      this.setState({product: product});
  
      const packageSizes = await packageSizeService.listPackageSizes(0, 100);
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
   * Handle name change
   * 
   * @param event event
   */
  private handeNameChange(event: React.FormEvent<HTMLInputElement>) {
    const product = {
      id: this.state.product!.id,
      name: [{
        language: "fi",
        value: event.currentTarget.value
      }],
      defaultPackageSizeId: this.state.product!.defaultPackageSizeId
    };

    this.setState({product: product});
  }

  /**
   * Handle form submit
   */
  private async handleSubmit() {
    try {
      if (!this.props.keycloak || !this.state.product) {
        return;
      }
  
      const productsService = await Api.getProductsService(this.props.keycloak);
  
      this.setState({saving: true});
      await productsService.updateProduct(this.state.product, this.state.product.id || "");
      this.setState({saving: false});
  
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
   * Handle product delete
   */
  private async handleDelete() {
    if (!this.props.keycloak || !this.state.product) {
      return;
    }

    const productsService = await Api.getProductsService(this.props.keycloak);
    const id = this.state.product.id || "";

    await productsService.deleteProduct(id);

    this.props.onProductDeleted && this.props.onProductDeleted(id!);
    this.setState({redirect: true});
  }


  /**
   *  Updates performed cultivation action name
   * 
   * @param name localized entry representing name
   */
  updateName = (name: LocalizedEntry) => {
    this.setState({
      product: {...this.state.product, name: name}
    });
  }

  /**
   * Handle package size select change
   * 
   * @param e event
   * @param {value} value
   */
  private onPackageSizeChange = (e: any, { value }: InputOnChangeData) => {
    this.setState({
      product: {...this.state.product, defaultPackageSizeId: value}
    });
  }

  /**
   * Render edit product view
   */
  public render() {
    if (!this.props.product) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

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
          <Grid.Column width={6}>
            <h2>{LocalizedUtils.getLocalizedValue(this.state.product ? this.state.product.name : undefined)}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={() => this.setState({open:true})}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{strings.productName}</label>
                <LocalizedValueInput 
                  onValueChange={this.updateName}
                  value={this.state.product ? this.state.product.name : undefined}
                  languages={["fi", "en"]}
                />
                <Form.Select 
                  fluid
                  required 
                  label={strings.packageSize} 
                  options={packageSizeOptions} 
                  placeholder={strings.packageSize} 
                  onChange={this.onPackageSizeChange}
                  value={this.state.product ? this.state.product.defaultPackageSizeId : undefined}
                />
              </Form.Field>
              <Message
                success
                visible={this.state.messageVisible}
                header={strings.savedSuccessfully}
              />
              <Button 
                className="submit-button" 
                onClick={this.handleSubmit} 
                type='submit'
                loading={this.state.saving}
              >
                {strings.save}
              </Button>
            </FormContainer>
          </Grid.Column>
        </Grid.Row>
        <Confirm open={this.state.open} size={"mini"} content={strings.deleteConfirmationText+ this.props.product!.name![0].value } onCancel={()=>this.setState({open:false})} onConfirm={this.handleDelete} />
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
    onProductSelected: (product: Product) => dispatch(actions.productSelected(product)),
    onProductDeleted: (productId: string) => dispatch(actions.productDeleted(productId)),
    onPackageSizesFound: (packageSizes: PackageSize[]) => dispatch(actions.packageSizesFound(packageSizes)),
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditProduct);