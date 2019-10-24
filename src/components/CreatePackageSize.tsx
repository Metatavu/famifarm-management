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
  Input,
} from "semantic-ui-react";
import LocalizedValueInput from "./LocalizedValueInput";
import { FormContainer } from "./FormContainer";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  packageSize?: PackageSize;
  onPackageSizeCreated?: (packageSize: PackageSize) => void,
  onError: (error: ErrorMessage) => void
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
  private async handleSubmit() {
    try {
      if (!this.props.keycloak) {
        return;
      }
  
      const packageSizeService = await Api.getPackageSizesService(this.props.keycloak);
      await packageSizeService.createPackageSize(this.state.packageSizeData);
      this.setState({redirect: true});
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
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
   * Updates the name of package size
   * 
   * @param event event
   */
  private updateSize = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      packageSizeData: {...this.state.packageSizeData, size: parseInt(event.currentTarget.value) || 0 }
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
            <FormContainer>
              <Form.Field required>
                <label>{strings.packageSizeName}</label>
                <LocalizedValueInput 
                  onValueChange={this.updateName}
                  value={this.state.packageSizeData.name}
                  languages={["fi", "en"]}
                />
              </Form.Field>
              <Form.Field required>
                <label>{strings.packageSizeSize}</label>
                <Input 
                  value={this.state.packageSizeData && this.state.packageSizeData.size} 
                  placeholder={strings.packageSizeSize}
                  onChange={this.updateSize}
                />
              </Form.Field>
              <Button className="submit-button" onClick={this.handleSubmit} type='submit'>{strings.save}</Button>
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
    onPackageSizeCreated: (packageSize: PackageSize) => dispatch(actions.packageSizeCreated(packageSize)),
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePackageSize);