import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { PackageSize } from "famifarm-typescript-models";
import strings from "src/localization/strings";

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";
import LocalizedUtils from "src/localization/localizedutils";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  packageSizes?: PackageSize[];
  onPackageSizesFound?: (packageSizes: PackageSize[]) => void;
}

export interface State {
  packageSizes: PackageSize[];
}

class PackageSizesList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
        packageSizes: []
    };
  }

  /**
   * Component did mount life-sycle method
   */
  async componentDidMount() {
    if (!this.props.keycloak) {
      return;
    }

    const packageSizeService = await Api.getPackageSizesService(this.props.keycloak);
    packageSizeService.listPackageSizes().then((packageSizes) => {
      this.props.onPackageSizesFound && this.props.onPackageSizesFound(packageSizes);
    });
  }

  /**
   * Render package size list view
   */
  render() {
    if (!this.props.packageSizes) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader active size="medium" />
        </Grid>
      );
    }

    const packageSizes = this.props.packageSizes.map((packageSize) => {
      const packageSizePath = `/packageSizes/${packageSize.id}`;
      return (
        <List.Item key={packageSize.id}>
          <List.Content floated='right'>
            <NavLink to={packageSizePath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Header>{LocalizedUtils.getLocalizedValue(packageSize.name)}</List.Header>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.packageSizes}</h2>
          <NavLink to="/createPackageSize">
            <Button className="submit-button">{strings.newPackageSize}</Button>
          </NavLink>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List>
              {packageSizes}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default PackageSizesList;