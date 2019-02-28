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
import EditProduct from "src/containers/EditProduct";
import EditPackageSize from "src/containers/EditPackageSize";
import EditSeed from "src/containers/EditSeed";
import EditProductionLine from "src/containers/EditProductionLine";
import EditSeedBatch from "src/containers/EditSeedBatch";
import BatchList from "src/containers/BatchList";
import BatchView from "./BatchView";
import WastageReasonList from "src/containers/WastageReasonList";
import EditWastageReason from "src/containers/EditWastageReason";
import CreateWastageReason from "src/containers/CreateWastageReason";
import PestList from "src/containers/PestList";
import EditPest from "./EditPest";
import CreatePest from "./CreatePest";
import EditEvent from "./EditEvent";
import ReportDownload from "./ReportDownload";

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
    },{
      "text": strings.wastageReasons,
      "route": "/wastageReasons"
    },{
      "text": strings.pests,
      "route": "/pests"
    },{
      "text": strings.reportDownloadHeader,
      "route": "/reports"
    }, {
      "text": strings.userManagementLink,
      "route": process.env.REACT_APP_ACCOUNT_MANAGEMENT_URL,
      "external": true
    }];

    const sideBarNavigation = navigationRoutes.map((navigationRoute, index) => {
      const itemParams = navigationRoute.external ? {
        href: navigationRoute.route,
        as: "a"
      } : {
        to: navigationRoute.route,
        as: NavLink
      };

      return (
        <Menu.Item
          key={index} 
          {...itemParams}>
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
                path="/products/:productId"
                exact={true}
                render={props => (
                    <EditProduct
                      keycloak={this.state.keycloak}
                      productId={props.match.params.productId as string}
                    />
                )}
              />
              <Route
                path="/events/:eventId"
                exact={true}
                render={props => (
                    <EditEvent
                      keycloak={this.state.keycloak}
                      eventId={props.match.params.eventId as string}
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
                path="/packageSizes/:packageSizeId"
                exact={true}
                render={props => (
                    <EditPackageSize
                      keycloak={this.state.keycloak}
                      packageSizeId={props.match.params.packageSizeId as string}
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
                path="/seeds/:seedId"
                exact={true}
                render={props => (
                    <EditSeed
                      keycloak={this.state.keycloak}
                      seedId={props.match.params.seedId as string}
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
                path="/pests"
                exact={true}
                render={props => (
                  <PestList
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/pests/:pestId"
                exact={true}
                render={props => (
                    <EditPest
                      keycloak={this.state.keycloak}
                      pestId={props.match.params.pestId as string}
                    />
                )}
              />
              <Route
                path="/createPest"
                exact={true}
                render={props => (
                  <CreatePest
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
                path="/productionLines/:productionLineId"
                exact={true}
                render={props => (
                    <EditProductionLine
                      keycloak={this.state.keycloak}
                      productionLineId={props.match.params.productionLineId as string}
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
                path="/seedBatches/:seedBatchId"
                exact={true}
                render={props => (
                    <EditSeedBatch
                      keycloak={this.state.keycloak}
                      seedBatchId={props.match.params.seedBatchId as string}
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
              <Route
                path="/wastageReasons"
                exact={true}
                render={props => (
                  <WastageReasonList
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/wastageReasons/:wastageReasonId"
                exact={true}
                render={props => (
                    <EditWastageReason
                      keycloak={this.state.keycloak}
                      wastageReasonId={props.match.params.wastageReasonId as string}
                    />
                )}
              />
              <Route
                path="/createWastageReason"
                exact={true}
                render={props => (
                  <CreateWastageReason
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/reports"
                exact={true}
                render={props => (
                  <ReportDownload
                    keycloak={this.state.keycloak}
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
