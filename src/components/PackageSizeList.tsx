import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Facility, PackageSize } from "../generated/client";
import strings from "../localization/strings";

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";
import LocalizedUtils from "../localization/localizedutils";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  packageSizes?: PackageSize[];
  facility: Facility;
  onPackageSizesFound?: (packageSizes: PackageSize[]) => void,
  onError: (error: ErrorMessage | undefined) => void
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
    const { keycloak, facility, onError, onPackageSizesFound } = this.props;
    try {
      if (!keycloak) {
        return;
      }
  
      const packageSizeService = await Api.getPackageSizesService(keycloak);
      const packageSizes = await packageSizeService.listPackageSizes({ facility: facility });
  
      onPackageSizesFound && onPackageSizesFound(packageSizes);
    } catch (e: any) {
      onError({
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
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    const packageSizes = this.props.packageSizes.map((packageSize, i) => {
      const packageSizePath = `/packageSizes/${packageSize.id}`;
      return (
        <List.Item style={i % 2 == 0 ? {backgroundColor: "#ddd"} : {}} key={packageSize.id}>
          <List.Content floated='right'>
            <NavLink to={packageSizePath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Content>
            <List.Header style={{paddingTop: "10px"}}>{LocalizedUtils.getLocalizedValue(packageSize.name)}</List.Header>
          </List.Content>
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
            <List divided animated verticalAlign='middle'>
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
    onPackageSizesFound: (packageSizes: PackageSize[]) => dispatch(actions.packageSizesFound(packageSizes)),
     onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PackageSizeList);