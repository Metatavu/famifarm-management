import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { PackageSize, PackageSizeOpt, LocalizedEntry } from "famifarm-typescript-models";
import { Redirect } from 'react-router';
import strings from "../localization/strings";

import {
  Grid,
  Button,
  Form,
} from "semantic-ui-react";
import LocalizedValueInput from "./LocalizedValueInput";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  packageSize?: PackageSize;
  onPackageSizeCreated?: (packageSize: PackageSize) => void;
}

export interface State {
  packageSizeData: PackageSizeOpt;
  redirect: boolean;
}

class CreatePackageSize extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      redirect: false,
      packageSizeData: {}
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

    const packageSizeService = await Api.getPackageSizesService(this.props.keycloak);
    packageSizeService.createPackageSize(this.state.packageSizeData).then(() => {
      this.setState({redirect: true});
    });
  }

  /**
   * Updates the name of package size
   * 
   * @param name localized package size name
   */
  private updateName = (name: LocalizedEntry) => {
    this.setState({
      packageSizeData: {...this.state.packageSizeData, name: name}
    });
  }

  /**
   * Render edit view for package size
   */
  public render() {
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
                <LocalizedValueInput 
                  onValueChange={this.updateName}
                  value={this.state.packageSizeData.name}
                  languages={["fi", "en"]}
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

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    packageSizes: state.packageSizes,
    packageSize: state.packageSize
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onPackageSizeCreated: (packageSize: PackageSize) => dispatch(actions.packageSizeCreated(packageSize))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePackageSize);