import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { PackageSize } from 'famifarm-client';
import { Redirect } from 'react-router';
import strings from "src/localization/strings";

import {
  Grid,
  Button,
  Loader,
  Form,
  Input,
  Message
} from "semantic-ui-react";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  packageSizeId: string;
  packageSize?: PackageSize;
  onPackageSizeSelected?: (packageSize: PackageSize) => void;
  onPackageSizeDeleted?: (packageSizeId: string) => void;
}

export interface State {
  packageSize?: PackageSize;
  redirect: boolean;
  saving: boolean;
  messageVisible: boolean;
}

class EditPackageSize extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      packageSize: undefined,
      redirect: false,
      saving: false,
      messageVisible: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handeNameChange = this.handeNameChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  /**
   * Component did mount life-sycle method
   */
  componentDidMount() {
    new FamiFarmApiClient().findPackageSize(this.props.keycloak!, this.props.packageSizeId).then((packageSize) => {
      this.props.onPackageSizeSelected && this.props.onPackageSizeSelected(packageSize);
      this.setState({packageSize: packageSize});
    });
  }

  /**
   * Handle name change
   * 
   * @param event event
   */
  handeNameChange(event: React.FormEvent<HTMLInputElement>) {
    const packageSize = {
      id: this.state.packageSize!.id,
      name: event.currentTarget.value
    };

    this.setState({packageSize: packageSize});
  }

  /**
   * Handle form submit
   */
  async handleSubmit() {
    this.setState({saving: true});
    await new FamiFarmApiClient().updatePackageSize(this.props.keycloak!, this.state.packageSize!);
    this.setState({saving: false});

    this.setState({messageVisible: true});
    setTimeout(() => {
      this.setState({messageVisible: false});
    }, 3000);
  }

  /**
   * Handle packageSize delete
   */
  handleDelete() {
    const id = this.state.packageSize!.id;

    new FamiFarmApiClient().deletePackageSize(this.props.keycloak!, id!).then(() => {
      this.props.onPackageSizeDeleted && this.props.onPackageSizeDeleted(id!);
      this.setState({redirect: true});
    });
  }

  /**
   * Render edit packageSize view
   */
  render() {
    if (!this.props.packageSize) {
      return (
        <Grid style={{paddingTop: "100px"}} centered className="pieru">
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
            <h2>{this.props.packageSize!.name}</h2>
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            <Button className="danger-button" onClick={this.handleDelete}>{strings.delete}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
          <Form>
          <Form.Field required>
            <label>{strings.packageSizeName}</label>
            <Input 
              value={this.state.packageSize && this.state.packageSize!.name} 
              placeholder={strings.packageSizeName}
              onChange={this.handeNameChange}
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

export default EditPackageSize;