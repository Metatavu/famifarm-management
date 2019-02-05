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

import {
  Grid,
  Loader,
  List,
  Container
} from "semantic-ui-react";

import BasicLayout from "./BasicLayout";
import SeedList from "src/containers/SeedList";
import CreateSeed from "./CreateSeed";
import ProductionLineList from "src/containers/ProductionLineList";
import CreateProductionLine from "./CreateProductionLine";
import SeedBatchList from "src/containers/SeedBatchList";
import CreateSeedBatch from "src/containers/CreateSeedBatch";

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

  render() {

    const navigationRoutes = [{
      text: "Tiimit",
      route: "/teams"
    }, {
      text: "Tuotteet",
      route: "/products"
    }, {
      text: "Pakkauskoot",
      route: "/packageSizes"
    }, {
      text: "Siemenet",
      route: "/seeds"
    }, {
      text: "Tuotantolinjat",
      route: "/productionLines"
    }, {
      text: "Siemenerät",
      route: "/seedBatches"
    }];

    const sideBarNavigation = navigationRoutes.map((navigationRoute) => {
      return (
        <NavLink to={navigationRoute.route}>
           <List.Item>
            <List.Content>
              <List.Header>
                <Container textAlign='center'>
                  <h3>{navigationRoute.text}</h3>
                </Container>
              </List.Header>
            </List.Content>
          </List.Item>
        </NavLink>
      );
    });

    const appContent = (
      <BasicLayout>
        { !this.props.authenticated ? (
        <div>
          <Grid centered>
            <Loader active size="medium" />
          </Grid>
        </div>
        ) : (
          <Grid.Row>
            <Grid.Column width={4} className="side-navigation-bar">
            <List>
              {sideBarNavigation}
            </List>
            </Grid.Column>
            <Grid.Column width={12}>
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
            </Grid.Column>
          </Grid.Row>
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
