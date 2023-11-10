import * as React from "react";
import Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Route, NavLink, Routes } from 'react-router-dom';
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
import { WithParams } from "./WithParams";
import Dashboard from "./Dashboard";
import { Facility } from "../generated/client";

export interface Props {
  authenticated: boolean,
  keycloak?: Keycloak.KeycloakInstance,
  facility: Facility,
  onLogin?: (keycloak: Keycloak.KeycloakInstance, authenticated: boolean) => void,
  onFacilityUpdate: (facility: Facility) => void,
  onLocaleUpdate: (locale: string) => void,
  locale: string;
}

class WelcomePage extends React.Component<Props, any> {
  constructor(props: Props) {
    super(props);
    this.state = {
        keycloak: null
    };
  }

  /**
   * Component did mount life-cycle event
   */
  componentDidMount = async () => {
    const { onFacilityUpdate, onLogin, onLocaleUpdate, locale } = this.props;
    const kcConf = {
      "realm": process.env.REACT_APP_KEYCLOAK_REALM as string,
      "url": process.env.REACT_APP_AUTH_SERVER_URL as string,
      "clientId": process.env.REACT_APP_AUTH_RESOURCE as string
    };
    const keycloak = new Keycloak(kcConf);
    await keycloak.init({onLoad: "login-required", checkLoginIframe: false}).success((authenticated) => {
      onLogin && onLogin(keycloak, authenticated);
    });

    const previousFacility = window.localStorage.getItem("facility") ? (window.localStorage.getItem("facility")) as Facility || Facility.Joroinen : Facility.Joroinen;

    if (keycloak.hasRealmRole("juva") && keycloak.hasRealmRole("joroinen")) {
      onFacilityUpdate(previousFacility);
      strings.setLanguage(`${locale.slice(0, 2)}_${previousFacility.toLowerCase()}`);
      onLocaleUpdate(`${locale.slice(0, 2)}_${previousFacility.toLowerCase()}`);
    } else {
      const userFacility = keycloak.hasRealmRole("joroinen") ? Facility.Joroinen : Facility.Juva;
      onFacilityUpdate(userFacility);
      strings.setLanguage(`${locale.slice(0, 2)}_${userFacility.toLowerCase()}`);
      onLocaleUpdate(`${locale.slice(0, 2)}_${userFacility.toLowerCase()}`);
    }

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
      "text": strings.dashboard,
      "route": "/dashboard"
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
        { !this.props.authenticated || !this.state.keycloak ? (
          <div>
            <Grid centered>
              <Loader active size="medium" />
            </Grid>
          </div>
        ) : (
          <Routes>
            <Route
                path="/"
                element={
                  <Root
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/events"
                element={
                  <EventList
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/packings"
                element={
                  <PackingList
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/cutPackings"
                element={
                  <CutPackingsList
                    keycloak={ this.state.keycloak }
                  />
                }
              />
              <Route
                path="/discards"
                element={
                  <DiscardList keycloak={ this.state.keycloak }/>
                }
              />
              <Route
                path="/campaigns"
                element={
                  <CampaignList
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/store"
                element={
                  <ViewStore
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/packings/:packingId"
                element={
                  <WithParams Component={EditPacking} keycloak={this.state.keycloak} routeParamNames={["packingId"]} />
                }
              />
              <Route
                path="/cutPackings/:cutPackingId"
                element={
                  <WithParams Component={EditCutPacking} keycloak={this.state.keycloak} routeParamNames={["cutPackingId"]} />
                }
              />
              <Route
                path="/campaigns/:campaignId"
                element={
                  <WithParams Component={EditCampaign} keycloak={this.state.keycloak} routeParamNames={["campaignId"]} />
                }
              />
              <Route
                path="/discards/:discardId"
                element={
                  <WithParams Component={EditDiscard} keycloak={this.state.keycloak} routeParamNames={["discardId"]} />
                }
              />
              <Route
                path="/createPacking"
                element={
                  <CreatePacking keycloak={ this.state.keycloak }/>
                }
              />
              <Route
                path="/createDiscard"
                element={
                  <CreateDiscard keycloak={ this.state.keycloak }/>
                }
              />
              <Route
                path="/createCutPacking"
                element={
                  <CreateCutPacking keycloak={ this.state.keycloak }/>
                }
              />
              <Route
                path="/createCampaign"
                element={
                  <CreateCampaign keycloak={this.state.keycloak}/>
                }
              />
              <Route
                path="/products"
                element={
                  <ProductList
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/products/:productId"
                element={
                  <WithParams Component={EditProduct} keycloak={this.state.keycloak} routeParamNames={["productId"]} />
                }
              />
              <Route
                path="/events/:eventId"
                element={
                  <WithParams Component={EditEvent} keycloak={this.state.keycloak} routeParamNames={["eventId"]} />
                }
              />
              <Route
                path="/createEvent"
                element={
                  <CreateEvent
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/createProduct"
                element={
                  <CreateProduct
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/packageSizes"
                element={
                  <PackageSizeList
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/packageSizes/:packageSizeId"
                element={
                  <WithParams Component={EditPackageSize} keycloak={this.state.keycloak} routeParamNames={["packageSizeId"]} />
                }
              />
              <Route
                path="/createPackageSize"
                element={
                  <CreatePackageSize
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/seeds"
                element={
                  <SeedList
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/seeds/:seedId"
                element={
                  <WithParams Component={EditSeed} keycloak={this.state.keycloak} routeParamNames={["seedId"]} />
                }
              />
              <Route
                path="/createSeed"
                element={
                  <CreateSeed
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/pests"
                element={
                  <PestList
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/pests/:pestId"
                element={
                  <WithParams Component={EditPest} keycloak={this.state.keycloak} routeParamNames={["pestId"]} />
                }
              />
              <Route
                path="/createPest"
                element={
                  <CreatePest
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/productionLines"
                element={
                  <ProductionLineList
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/productionLines/:productionLineId"
                element={
                  <WithParams Component={EditProductionLine} keycloak={this.state.keycloak} routeParamNames={["productionLineId"]} />
                }
              />
              <Route
                path="/createProductionLine"
                element={
                  <CreateProductionLine
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/seedBatches"
                element={
                  <SeedBatchList
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/seedBatches/:seedBatchId"
                element={
                  <WithParams Component={EditSeedBatch} keycloak={this.state.keycloak} routeParamNames={["seedBatchId"]} />
                }
              />
              <Route
                path="/createSeedBatch"
                element={
                  <CreateSeedBatch
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/performedCultivationActions"
                element={
                  <PerformedCultivationActionList
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/createPerformedCultivationAction"
                element={
                  <CreatePerformedCultivationAction
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/performedCultivationActions/:performedCultivationActionId"
                element={
                  <WithParams Component={EditPerformedCultivationAction} keycloak={this.state.keycloak} routeParamNames={["performedCultivationActionId"]} />
                }
              />
              <Route
                path="/wastageReasons"
                element={
                  <WastageReasonList
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/wastageReasons/:wastageReasonId"
                element={
                  <WithParams Component={EditWastageReason} keycloak={this.state.keycloak} routeParamNames={["wastageReasonId"]} />
                }
              />
              <Route
                path="/createWastageReason"
                element={
                  <CreateWastageReason
                    keycloak={ this.state.keycloak }
                    facility={ this.props.facility }
                  />
                }
              />
              <Route
                path="/reports"
                element={
                  <ReportDownload
                    keycloak={this.state.keycloak}
                  />
                }
              />
              <Route
                path="/dashboard"
                element={
                  <Dashboard
                    keycloak={this.state.keycloak}
                  />
                }
              />
            </Routes>
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
    locale: state.locale,
    facility: state.facility
  }
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onLogin: (keycloak: Keycloak.KeycloakInstance, authenticated: boolean) => dispatch(actions.userLogin(keycloak, authenticated)),
    onFacilityUpdate: (facility: Facility) => dispatch(actions.facilityUpdate(facility)),
    onLocaleUpdate: (locale: string) => dispatch(actions.localeUpdate(locale))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(WelcomePage);
