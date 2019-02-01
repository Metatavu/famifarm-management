import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { NavLink } from 'react-router-dom';
import { PackageSize } from 'famifarm-client';

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";

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

  componentDidMount() {
    new FamiFarmApiClient().listPackageSizes(this.props.keycloak!, 0, 100).then((packageSizes) => {
      this.props.onPackageSizesFound && this.props.onPackageSizesFound(packageSizes);
    });
  }

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
        <List.Item>
          <List.Content floated='right'>
            <NavLink to={packageSizePath}>
              <Button className="submit-button">Avaa</Button>
            </NavLink>
          </List.Content>
          <List.Header>{packageSize.name}</List.Header>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row">
          <Grid.Column width={3}>
            <h2>Pakkauskoot</h2>
          </Grid.Column>
          <Grid.Column width={2} floated="right">
            <NavLink to="/createPackageSize">
              <Button className="submit-button">Uusi pakkauskoko</Button>
            </NavLink>
          </Grid.Column>
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