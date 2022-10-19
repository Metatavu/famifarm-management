import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";import Api from "../api";
import { LocalizedValue, PackageSize } from "../generated/client";
import { redirect } from 'react-router-dom';
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
  keycloak?: Keycloak.KeycloakInstance;
  packageSizeId: string;
  packageSize?: PackageSize;
  onPackageSizeSelected?: (packageSize: PackageSize) => void;
  onPackageSizeDeleted?: (packageSizeId: string) => void,
   onError: (error: ErrorMessage | undefined) => void
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
    try {
      if (!this.props.keycloak) {
        return;
      }
  
      const packageSizeService = await Api.getPackageSizesService(this.props.keycloak);
      const packageSize = await packageSizeService.findPackageSize({packageSizeId: this.props.packageSizeId});
      this.props.onPackageSizeSelected && this.props.onPackageSizeSelected(packageSize);
      this.setState({packageSize: packageSize});
    } catch (e: any) {
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
  private async handleSubmit() {
    try {
      if (!this.props.keycloak) {
        return;
      }
  
      const packageSizeObject = this.state.packageSize || {};
      const packageSizeService = await Api.getPackageSizesService(this.props.keycloak);
      this.setState({saving: true});
      await packageSizeService.updatePackageSize({packageSizeId: packageSizeObject.id!, packageSize: packageSizeObject });
      this.setState({saving: false, messageVisible: true});
      setTimeout(() => {
        this.setState({messageVisible: false});
      }, 3000);
    } catch (e: any) {
      this.props.onError({
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
    try {
      if (!this.props.keycloak || !this.state.packageSize) {
        return;
      }
  
      const id = this.state.packageSize.id || "";
      const packageSizeService = await Api.getPackageSizesService(this.props.keycloak);
      await packageSizeService.deletePackageSize({packageSizeId: id});
      this.props.onPackageSizeDeleted && this.props.onPackageSizeDeleted(id!);
      this.setState({redirect: true});
    } catch (e: any) {
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
      redirect("/packageSizes");
      return null;
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
    onPackageSizeSelected: (packageSize: PackageSize) => dispatch(actions.packageSizeSelected(packageSize)),
    onPackageSizeDeleted: (packageSizeId: string) => dispatch(actions.packageSizeDeleted(packageSizeId)),
     onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditPackageSize);