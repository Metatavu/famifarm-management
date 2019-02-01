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

    const sideBarNavigation = [1,2,3].map((index) => {
      return (
        <NavLink to="/teams">
           <List.Item>
            <List.Content>
              <List.Header>
                <Container textAlign='center'>
                  <h3>Tiimit</h3>
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
            <Grid.Column width={3} className="side-navigation-bar">
            <List>
              {sideBarNavigation}
            </List>
            </Grid.Column>
            <Grid.Column width={13}>
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