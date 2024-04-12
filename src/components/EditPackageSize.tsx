import * as React from "react";
import Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";import Api from "../api";
import { Facility, LocalizedValue, PackageSize } from "../generated/client";
import { Navigate } from 'react-router-dom';
import strings from "../localization/strings";

import {
  Grid,
  Button,
  Loader,
  Form,
  Message,
  Confirm,
  Input
} from "semantic-ui-react";
import LocalizedValueInput from "./LocalizedValueInput";
import LocalizedUtils from "../localization/localizedutils";
import { FormContainer } from "./FormContainer";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak;
  packageSizeId: string;
  packageSize?: PackageSize;
  facility: Facility;
  onPackageSizeSelected?: (packageSize: PackageSize) => void;
  onPackageSizeDeleted?: (packageSizeId: string) => void;
  onError: (error: ErrorMessage | undefined) => void;
}

/**
 * Interface representing component state
 */
interface State {
  packageSize?: PackageSize;
  redirect: boolean;
  saving: boolean;
  messageVisible: boolean;
  open: boolean;
}

/**
 * React component for edit package size layout
 */
class EditPackageSize extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      packageSize: undefined,
      redirect: false,
      saving: false,
      messageVisible: false,
      open:false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  /**
   * Component did mount life-sycle method
   */
  public async componentDidMount() {
    const { packageSizeId, keycloak, facility, onError, onPackageSizeSelected } = this.props;
    try {
      if (!keycloak) {
        return;
      }
  
      const packageSizeService = await Api.getPackageSizesService(keycloak);
      const packageSize = await packageSizeService.findPackageSize({
        packageSizeId: packageSizeId,
        facility: facility
      });
      onPackageSizeSelected && onPackageSizeSelected(packageSize);
      this.setState({packageSize: packageSize});
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
  private async handleSubmit() {
    const { keycloak, facility, onError } = this.props;
    const { packageSize } = this.state;
    try {
      if (!keycloak) {
        return;
      }
  
      const packageSizeObject = packageSize || {};
      const packageSizeService = await Api.getPackageSizesService(keycloak);
      this.setState({saving: true});
      await packageSizeService.updatePackageSize({
        packageSizeId: packageSizeObject.id!,
        packageSize: packageSizeObject,
        facility: facility
      });
      this.setState({saving: false, messageVisible: true});
      setTimeout(() => {
        this.setState({messageVisible: false});
      }, 3000);
    } catch (e: any) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Handle packageSize delete
   */
  private async handleDelete() {
    const { keycloak, facility, onError, onPackageSizeDeleted } = this.props;
    const { packageSize } = this.state;
    try {
      if (!keycloak || !packageSize) {
        return;
      }
  
      const id = packageSize.id || "";
      const packageSizeService = await Api.getPackageSizesService(keycloak);
      await packageSizeService.deletePackageSize({
        packageSizeId: id,
        facility: facility
      });
      onPackageSizeDeleted && onPackageSizeDeleted(id!);
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
      packageSize: {...this.state.packageSize, name: name}
    });
  }

  /**
   * Updates the name of package size
   * 
   * @param event event
   */
  private updateSize = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      packageSize: {...this.state.packageSize, size: parseInt(event.currentTarget.value) || 0 }
    });
  }

  /**
   * Render edit packageSize view
   */
  public render() {
    if (!this.props.packageSize) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Navigate replace={true} to="/packageSizes"/>;
    }

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={6}>
            <h2>{LocalizedUtils.getLocalizedValue(this.state.packageSize ? this.state.packageSize.name : undefined)}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={() => this.setState({open:true})}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <FormContainer>
              <Form.Field required>
                <label>{strings.packageSizeName}</label>
                <LocalizedValueInput 
                  onValueChange={this.updateName}
                  value={this.state.packageSize ? this.state.packageSize.name : undefined}
                  languages={["fi", "en"]}
                />
              </Form.Field>
              <Form.Field required>
                <label>{strings.packageSizeSize}</label>
                <Input 
                  value={this.state.packageSize && this.state.packageSize.size} 
                  placeholder={strings.packageSizeSize}
                  onChange={this.updateSize}
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
        <Confirm open={this.state.open} size={"mini"} content={strings.deleteConfirmationText+this.props.packageSize!.name } onCancel={()=>this.setState({open:false})} onConfirm={this.handleDelete} />
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
    onPackageSizeSelected: (packageSize: PackageSize) => dispatch(actions.packageSizeSelected(packageSize)),
    onPackageSizeDeleted: (packageSizeId: string) => dispatch(actions.packageSizeDeleted(packageSizeId)),
    onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditPackageSize);