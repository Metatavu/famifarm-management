import * as React from "react";
import * as Keycloak from 'keycloak-js';
import { Header, Icon, Grid } from 'semantic-ui-react';
import strings from "../localization/strings";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance,
}

class WelcomePage extends React.Component<Props, any> {
  constructor(props: Props) {
    super(props);
  }

  /**
   * Rendr root component view
   */
  render() {
    return (
      <Grid centered>
        <Grid.Row>
          <Header as='h2' icon>
            <Icon name='settings' />
            {strings.siteHeader}
            <Header.Subheader>{strings.siteSubHeader}</Header.Subheader>
          </Header>
        </Grid.Row>
      </Grid>

    );
  }
}

export default WelcomePage;