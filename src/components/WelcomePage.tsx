import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Route, NavLink } from 'react-router-dom';
import Root from './Root';
import strings from "../localization/strings";

import {
  Grid,
  Loader,
  Menu,
} from "semantic-ui-react";

import BasicLayout from "./BasicLayout";
import CreateSeed from "./CreateSeed";
import CreateProductionLine from "./CreateProductionLine";
import EditPest from "./EditPest";
import CreatePest from "./CreatePest";
import EditEvent from "./EditEvent";
import ReportDownload from "./ReportDownload";
import SeedList from "./SeedList";
import EditPacking from "./EditPacking";
import EditProduct from "./EditProduct";
import EditPackageSize from "./EditPackageSize";
import EditSeed from "./EditSeed";
import PestList from "./PestList";
import ProductionLineList from "./ProductionLineList";
import EditProductionLine from "./EditProductionLine";
import SeedBatchList from "./SeedBatchList";
import EditSeedBatch from "./EditSeedBatch";
import CreateSeedBatch from "./CreateSeedBatch";
import PerformedCultivationActionList from "./PerformedCultivationActionList";
import CreatePerformedCultivationAction from "./CreatePerformedCultivationAction";
import EditPerformedCultivationAction from "./EditPerformedCultivationAction";
import EditWastageReason from "./EditWastageReason";
import WastageReasonList from "./WastageReasonList";
import CreateWastageReason from "./CreateWastageReason";
import ProductList from "./ProductList";
import CreateProduct from "./CreateProduct";
import PackageSizeList from "./PackageSizeList";
import CreatePackageSize from "./CreatePackageSize";
import CreateEvent from "./CreateEvent";
import PackingList from "./PackingList";
import CreatePacking from "./CreatePacking";
import ViewStore from "./ViewStore";
import CampaignList from "./CampaignList";
import CreateCampaign from "./CreateCampaign";
import EditCampaign from "./EditCampaign";
import CreateCutPacking from "./CreateCutPacking";
import EditCutPacking from "./EditCutPacking";
import CutPackingsList from "./CutPackingsList";
import EventList from "./EventList";
import DiscardList from "./DiscardList";
import CreateDiscard from "./CreateDiscard";
import EditDiscard from "./EditDiscard";

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
    keycloak.init({onLoad: "login-required", checkLoginIframe: false}).success((authenticated) => {
      this.props.onLogin && this.props.onLogin(keycloak, authenticated);
    });

    this.setState({keycloak: keycloak});
  }

  /**
   * Render welcome page view
   */
  public render() {
    const navigationRoutes = [{
      "text": strings.events,
      "route": "/events"
    },{
      "text": strings.packings,
      "route": "/packings"
    },{
      "text": strings.cutPackings,
      "route": "/cutPackings"
    },{
      "text": strings.discards,
      "route": "/discards"
    },{
      "text": strings.campaigns,
      "route": "/campaigns"
    },{
      "text": strings.store,
      "route": "/store"
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
    },{
      "text": strings.userManagementLink,
      "route": process.env.REACT_APP_ACCOUNT_MANAGEMENT_URL,
      "external": true
    }];

    const sideBarNavigation = navigationRoutes.map((navigationRoute, index) => {
      const itemParams = navigationRoute.external ? {
        href: navigationRoute.route,
        target: "blank",
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
                path="/events"
                exact={true}
                render={props => (
                  <EventList
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/packings"
                exact={true}
                render={props => (
                  <PackingList
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/cutPackings"
                exact={ true }
                render={ props => (
                  <CutPackingsList
                    keycloak={ this.state.keycloak }
                  />
                )}
              />
              <Route
                path="/discards"
                exact
                render={ () => <DiscardList keycloak={ this.state.keycloak }/> }
              />
              <Route
                path="/campaigns"
                exact={true}
                render={props => (
                  <CampaignList
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route
                path="/store"
                exact={true}
                render={props => (
                  <ViewStore
                    keycloak={this.state.keycloak}
                  />
                )}
              />
              <Route 
                path="/packings/:packingId"
                exact={true}
                render={props => (
                  <EditPacking
                    keycloak={this.state.keycloak}
                    packingId={props.match.params.packingId as string}
                />
                )}
              />
              <Route 
                path="/cutPackings/:cutPackingId"
                exact={ true }
                render={ props => (
                  <EditCutPacking
                    keycloak={ this.state.keycloak }
                    cutPackingId={ props.match.params.cutPackingId as string }
                  />
                ) }
              />
              <Route 
                path="/campaigns/:campaignId"
                exact={ true }
                render={ props => (
                  <EditCampaign
                    keycloak={ this.state.keycloak }
                    campaignId={ props.match.params.campaignId as string }
                />
                )}
              />
              <Route
                path="/discards/:discardId"
                exact
                render={ props => (
                  <EditDiscard
                    keycloak={ this.state.keycloak }
                    discardId={ props.match.params.discardId as string }
                  />
                )}
              />
              <Route
                path="/createPacking"
                exact
                render={ props => (
                  <CreatePacking keycloak={ this.state.keycloak }/>
                )}
              />
              <Route
                path="/createDiscard"
                exact
                render={ props => (
                  <CreateDiscard keycloak={ this.state.keycloak }/>
                )}
              />
              <Route
                path="/createCutPacking"
                exact={true}
                render={props => (
                  <CreateCutPacking keycloak={ this.state.keycloak }/>
                )}
              />
              <Route
                path="/createCampaign"
                exact={true}
                render={props => (
                  <CreateCampaign keycloak={this.state.keycloak}/>
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
                path="/createEvent"
                exact={true}
                render={props => (
                    <CreateEvent
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
      <div>
        {appContent}
      </div>
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
    authenticated: state.authenticated,
    keycloak: state.keycloak,
    locale: state.locale
  }
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onLogin: (keycloak: Keycloak.KeycloakInstance, authenticated: boolean) => dispatch(actions.userLogin(keycloak, authenticated))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(WelcomePage);
