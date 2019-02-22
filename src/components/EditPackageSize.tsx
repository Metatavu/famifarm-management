import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { PackageSize, PackageSizeOpt, LocalizedEntry } from "famifarm-typescript-models";
import { Redirect } from 'react-router';
import strings from "src/localization/strings";

import {
  Grid,
  Button,
  Loader,
  Form,
  Message,
  Confirm
} from "semantic-ui-react";
import LocalizedValueInput from "./LocalizedValueInput";
import LocalizedUtils from "src/localization/localizedutils";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  packageSizeId: string;
  packageSize?: PackageSize;
  onPackageSizeSelected?: (packageSize: PackageSize) => void;
  onPackageSizeDeleted?: (packageSizeId: string) => void;
}

/**
 * Interface representing component state
 */
interface State {
  packageSize?: PackageSizeOpt;
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
    if (!this.props.keycloak) {
      return;
    }

    const packageSizeService = await Api.getPackageSizesService(this.props.keycloak);

    packageSizeService.findPackageSize(this.props.packageSizeId).then((packageSize) => {
      this.props.onPackageSizeSelected && this.props.onPackageSizeSelected(packageSize);
      this.setState({packageSize: packageSize});
    });
  }

  /**
   * Handle form submit
   */
  private async handleSubmit() {
    if (!this.props.keycloak) {
      return;
    }

    const packageSizeObject = this.state.packageSize || {};
    const packageSizeService = await Api.getPackageSizesService(this.props.keycloak);
    this.setState({saving: true});
    await packageSizeService.updatePackageSize(packageSizeObject, packageSizeObject.id || "");
    this.setState({saving: false, messageVisible: true});
    setTimeout(() => {
      this.setState({messageVisible: false});
    }, 3000);
  }

  /**
   * Handle packageSize delete
   */
  private async handleDelete() {
    if (!this.props.keycloak || !this.state.packageSize) {
      return;
    }

    const id = this.state.packageSize.id || "";
    const packageSizeService = await Api.getPackageSizesService(this.props.keycloak);

    packageSizeService.deletePackageSize(id).then(() => {
      this.props.onPackageSizeDeleted && this.props.onPackageSizeDeleted(id!);
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
      packageSize: {...this.state.packageSize, name: name}
    });
  }

  /**
   * Render edit packageSize view
   */
  public render() {
    if (!this.props.packageSize) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader active size="medium" />
        </Grid>
      );
    }

    if (this.state.redirect) {
      return <Redirect to="/packageSizes" push={true} />;
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
          <Form>
          <Form.Field required>
            <label>{strings.packageSizeName}</label>
            <LocalizedValueInput 
              onValueChange={this.updateName}
              value={this.state.packageSize ? this.state.packageSize.name : undefined}
              languages={["fi", "en"]}
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
        <Confirm open={this.state.open} size={"mini"} content={strings.deleteConfirmationText+this.props.packageSize!.name } onCancel={()=>this.setState({open:false})} onConfirm={this.handleDelete} />
      </Grid>
    );
  }
}

export default EditPackageSize;