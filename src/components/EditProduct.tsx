import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { Product, PackageSize } from 'famifarm-client';
import { Redirect } from 'react-router';
import strings from "src/localization/strings";

import {
  Grid,
  Button,
  Loader,
  Form,
  Input,
  Message,
  InputOnChangeData
} from "semantic-ui-react";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  productId: string;
  product?: Product;
  packageSizes?: PackageSize[];
  onProductSelected?: (product: Product) => void;
  onProductDeleted?: (productId: string) => void;
  onPackageSizesFound?: (packageSizes: PackageSize[]) => void;
}

export interface State {
  product?: Product;
  redirect: boolean;
  saving: boolean;
  messageVisible: boolean;
  defaultPackageSize: string;
}

class EditProduct extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      product: undefined,
      redirect: false,
      saving: false,
      messageVisible: false,
      defaultPackageSize: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handeNameChange = this.handeNameChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  /**
   * Component did mount life-sycle method
   */
  componentDidMount() {
    new FamiFarmApiClient().findProduct(this.props.keycloak!, this.props.productId).then((product) => {
      this.props.onProductSelected && this.props.onProductSelected(product);
      this.setState({product: product});
    });

    new FamiFarmApiClient().listPackageSizes(this.props.keycloak!, 0, 100).then((packageSizes) => {
      this.props.onPackageSizesFound && this.props.onPackageSizesFound(packageSizes);
    });
  }

  /**
   * Handle name change
   * 
   * @param event event
   */
  handeNameChange(event: React.FormEvent<HTMLInputElement>) {
    const product = {
      id: this.state.product!.id,
      name: [{
        language: "fi",
        value: event.currentTarget.value
      }],
      defaultPackageSize: this.state.product!.defaultPackageSize
    };

    this.setState({product: product});
  }

  /**
   * Handle form submit
   */
  async handleSubmit() {
    console.log(this.state.product);
    this.setState({saving: true});
    await new FamiFarmApiClient().updateProduct(this.props.keycloak!, this.state.product!);
    this.setState({saving: false});

    this.setState({messageVisible: true});
    setTimeout(() => {
      this.setState({messageVisible: false});
    }, 3000);
  }

  /**
   * Handle product delete
   */
  handleDelete() {
    const id = this.state.product!.id;

    new FamiFarmApiClient().deleteProduct(this.props.keycloak!, id!).then(() => {
      this.props.onProductDeleted && this.props.onProductDeleted(id!);
      this.setState({redirect: true});
    });
  }

  /**
   * Handle select change
   * 
   * @param e event
   * @param {value} value
   */
  onSelectChange = (e: any, { value }: InputOnChangeData) => {
    const product = {
      id: this.state.product!.id,
      name: this.state.product!.name,
      defaultPackageSize: value
    };

    this.setState({product: product});
  }

  /**
   * Render edit product view
   */
  render() {
    if (!this.props.product) {
      return (
        <Grid style={{paddingTop: "100px"}} centered className="pieru">
          <Loader active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Redirect to="/products" push={true} />;
    }

    const packageSizeOptions = (this.props.packageSizes || []).map((packageSize) => {
      return {
        key: packageSize.id,
        text: packageSize.name,
        value: packageSize.id
      };
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={6}>
            <h2>{this.props.product!.name![0].value}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={this.handleDelete}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
          <Form>
          <Form.Field required>
            <label>{strings.productName}</label>
            <Input 
              value={this.state.product && this.state.product!.name![0].value} 
              placeholder={strings.productName}
              onChange={this.handeNameChange}
            />
            <Form.Select 
              fluid 
              label={strings.packageSize} 
              options={packageSizeOptions} 
              placeholder={strings.packageSize} 
              onChange={this.onSelectChange}
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
          </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default EditProduct;