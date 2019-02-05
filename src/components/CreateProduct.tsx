import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { Product, LocalizedValue, PackageSize } from 'famifarm-client';
import { Redirect } from 'react-router';
import strings from "../localization/strings";

import {
  Grid,
  Button,
  Form,
  Input,
  InputOnChangeData
} from "semantic-ui-react";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  product?: Product;
  packageSizes?: PackageSize[];
  onProductCreated?: (product: Product) => void;
  onPackageSizesFound?: (packageSizes: PackageSize[]) => void;
}

export interface State {
  name?: LocalizedValue[];
  redirect: boolean;
  defaultPackageSize: string;
}

class CreateProduct extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
        name: [{
          language: "fi",
          value: ""
        }],
        redirect: false,
        defaultPackageSize: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Component did mount life-cycle method
   */
  componentDidMount() {
    new FamiFarmApiClient().listPackageSizes(this.props.keycloak!, 0, 100).then((packageSizes) => {
      this.props.onPackageSizesFound && this.props.onPackageSizesFound(packageSizes);
    });
  }

  /**
   * Handle form submit
   */
  handleSubmit() {
    const productObject = {
      name: this.state.name,
      defaultPackageSize: this.state.defaultPackageSize
    };
    new FamiFarmApiClient().createProduct(this.props.keycloak!, productObject).then(() => {
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
    this.setState({defaultPackageSize: value});
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
        text: packageSize.name,
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
                <Input 
                  value={this.state.name![0].value} 
                  placeholder={strings.productName}
                  onChange={(e) => this.setState({name: [{language: "fi", value: e.currentTarget.value}]})}
                />
              </Form.Field>
              <Form.Select 
                fluid 
                label={strings.packageSize} 
                options={packageSizeOptions} 
                placeholder={strings.packageSize} 
                onChange={this.onSelectChange}
              />
              <Button className="submit-button" onClick={this.handleSubmit} type='submit'>{strings.save} </Button>
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default CreateProduct;