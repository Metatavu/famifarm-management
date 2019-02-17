import * as React from "react";
import * as Keycloak from 'keycloak-js';
import { BrowserRouter, Route, NavLink } from 'react-router-dom';
import Root from './Root';
import TeamList from '../containers/TeamList';
import ProductList from '../containers/ProductList';
import EditTeam from '../containers/EditTeam';
import CreateTeam from '../containers/CreateTeam';
import CreateProduct from '../containers/CreateProduct';
import PackageSizeList from '../containers/PackageSizeList';
import CreatePackageSize from '../containers/CreatePackageSize';
import strings from "src/localization/strings";

import {
  Grid,
  Loader,
  Menu,
} from "semantic-ui-react";

import BasicLayout from "./BasicLayout";
import SeedList from "src/containers/SeedList";
import CreateSeed from "./CreateSeed";
import ProductionLineList from "src/containers/ProductionLineList";
import CreateProductionLine from "./CreateProductionLine";
import SeedBatchList from "src/containers/SeedBatchList";
import CreateSeedBatch from "src/containers/CreateSeedBatch";
import PerformedCultivationActionList from "src/containers/PerformedCultivationActionList";
import CreatePerformedCultivationAction from "src/containers/CreatePerformedCultivationAction";
import EditPerformedCultivationAction from "src/containers/EditPerformedCultivationAction";
import BatchList from "src/containers/BatchList";
import BatchView from "./BatchView";

export interface Props {
  authenticated: boolean,
  keycloak?: Keycloak.KeycloakInstance,
  onLogin?: (keycloak: Keycloak.KeycloakInstance, authenticated: boolean) => void
}

class WelcomePage extends React.Component<Props, any> {
  constructor(props: Props) {
    super(props);
    this.state = {
        keycloak: null
    };
  }

  /**
   * Component did mount life-sycle event
   */
  componentDidMount() {
    const kcConf = {
      "realm": process.env.REACT_APP_KEYCLOAK_REALM,
      "url": process.env.REACT_APP_AUTH_SERVER_URL,
      "clientId": process.env.REACT_APP_AUTH_RESOURCE
    };
    const keycloak = Keycloak(kcConf);
    keycloak.init({onLoad: "login-required"}).success((authenticated) => {
      this.props.onLogin && this.props.onLogin(keycloak, authenticated);
    });

    this.setState({keycloak: keycloak});
  }

  /**
   * Render welcome page view
   */
  render() {
    const navigationRoutes = [{
      "text": strings.batches,
      "route": "/batches"
    },{
      "text": strings.teams,
      "route": "/teams"
    },{
      "text": strings.products,
      "route": "/products"
    },{
      "text": strings.packageSizes,
      "route": "/packageSizes"
    },{
      "text": strings.seeds,
      "route": "/seeds"
    },{
      "text": strings.productionLines,
      "route": "/productionLines"
    },{
      "text": strings.seedBatches,
      "route": "/seedBatches"
    },{
      "text": strings.performedCultivationActions,
      "route": "/performedCultivationActions"
    }];

    const sideBarNavigation = navigationRoutes.map((navigationRoute, index) => {
      return (
        <Menu.Item
          key={index} 
          to={navigationRoute.route} 
          as={NavLink}>
          {navigationRoute.text}
        </Menu.Item>
      );
    });

    const appContent = (
      <BasicLayout sidebarItems={sideBarNavigation}>
        { !this.props.authenticated ? (
          <div>
            <Grid centered>
              <Loader active size="medium" />
            </Grid>
          </div>
        ) : (
          <div>
            <Route
                path="/"
                exact={true}
                render={props => (
                  <Root
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/teams"
                exact={true}
                render={props => (
                  <TeamList
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/batches"
                exact={true}
                render={props => (
                  <BatchList
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/batches/:batchId"
                exact={true}
                render={props => (
                  <BatchView
                    keycloak={this.state.keycloak}
                    batchId={props.match.params.batchId as string}
                  />
                )}
              />
              <Route
                path="/teams/:teamId"
                exact={true}
                render={props => (
                  <EditTeam
                    keycloak={this.state.keycloak}
                    teamId={props.match.params.teamId as string}
                  />
                )}
              />
              <Route
                path="/createTeam"
                exact={true}
                render={props => (
                  <CreateTeam
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/products"
                exact={true}
                render={props => (
                  <ProductList
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/createProduct"
                exact={true}
                render={props => (
                  <CreateProduct
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/packageSizes"
                exact={true}
                render={props => (
                  <PackageSizeList
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/createPackageSize"
                exact={true}
                render={props => (
                  <CreatePackageSize
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/seeds"
                exact={true}
                render={props => (
                  <SeedList
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/createSeed"
                exact={true}
                render={props => (
                  <CreateSeed
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/productionLines"
                exact={true}
                render={props => (
                  <ProductionLineList
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/createProductionLine"
                exact={true}
                render={props => (
                  <CreateProductionLine
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/seedBatches"
                exact={true}
                render={props => (
                  <SeedBatchList
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/createSeedBatch"
                exact={true}
                render={props => (
                  <CreateSeedBatch
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/performedCultivationActions"
                exact={true}
                render={props => (
                  <PerformedCultivationActionList
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/createPerformedCultivationAction"
                exact={true}
                render={props => (
                  <CreatePerformedCultivationAction
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/performedCultivationActions/:createPerformedCultivationActionId"
                exact={true}
                render={props => (
                  <EditPerformedCultivationAction
                    keycloak={this.state.keycloak}
                    performedCultivationActionId={props.match.params.createPerformedCultivationActionId as string}
                  />
                )}
              />
            </div>
        )}
      </BasicLayout>
    );

    return (
      <BrowserRouter>
        <div>
          {appContent}
        </div>
      </BrowserRouter>
    );
  }
}

export default WelcomePage;
