import * as React from "react";
import Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { Facility, LocalizedValue, PackageSize } from "../generated/client";
import { Navigate } from 'react-router-dom';
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
  keycloak?: Keycloak;
  packageSize?: PackageSize;
  facility: Facility;
  onPackageSizeCreated?: (packageSize: PackageSize) => void;
  onError: (error: ErrorMessage | undefined) => void;
}

export interface State {
  packageSizeData: PackageSize;
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
    const { keycloak, facility, onError } = this.props;
    const { packageSizeData } = this.state;
    try {
      if (!keycloak) {
        return;
      }
  
      const packageSizeService = await Api.getPackageSizesService(keycloak);
      await packageSizeService.createPackageSize({
        packageSize: packageSizeData,
        facility: facility
      });
      this.setState({redirect: true});
    } catch (e: any) {
      onError({
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
  private updateName = (name: LocalizedValue[]) => {
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
      return <Navigate replace={true} to="/packageSizes"/>;
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
    packageSize: state.packageSize,
    facility: state.facility
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
    onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePackageSize);