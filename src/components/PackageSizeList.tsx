import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";import Api from "../api";
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
  onPackageSizesFound?: (packageSizes: PackageSize[]) => void,
  onError: (error: ErrorMessage) => void
}

export interface State {
  packageSizes: PackageSize[];
}

class PackageSizeList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
        packageSizes: []
    };
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
      const packageSizes = await packageSizeService.listPackageSizes();
  
      this.props.onPackageSizesFound && this.props.onPackageSizesFound(packageSizes);
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
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
    onPackageSizesFound: (packageSizes: PackageSize[]) => dispatch(actions.packageSizesFound(packageSizes)),
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PackageSizeList);