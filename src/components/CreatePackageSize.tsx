import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { PackageSize } from "famifarm-typescript-models";
import { Redirect } from 'react-router';
import strings from "../localization/strings";

import {
  Grid,
  Button,
  Form,
  Input
} from "semantic-ui-react";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  packageSize?: PackageSize;
  onPackageSizeCreated?: (packageSize: PackageSize) => void;
}

export interface State {
  name: string;
  redirect: boolean;
}

class EditPackageSize extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      name: "",
      redirect: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Handle form submit
   */
  async handleSubmit() {
    if (!this.props.keycloak) {
      return;
    }

    const packageSizeObject = {
      name: this.state.name
    };
    const packageSizeService = await Api.getPackageSizesService(this.props.keycloak);
    packageSizeService.createPackageSize(packageSizeObject).then(() => {
      this.setState({redirect: true});
    });
  }

  /**
   * Render edit view for package size
   */
  render() {
    if (this.state.redirect) {
      return <Redirect to="/packageSizes" push={true} />;
    }
    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={8}>
            <h2>{strings.newPackageSize}</h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <Form>
              <Form.Field required>
                <label>{strings.packageSizeName}</label>
                <Input 
                  value={this.state.name} 
                  placeholder='Nimi' 
                  onChange={(e) => this.setState({name: e.currentTarget.value})}
                />
              </Form.Field>
              <Button className="submit-button" onClick={this.handleSubmit} type='submit'>{strings.save}</Button>
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default EditPackageSize;