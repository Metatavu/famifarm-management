import * as React from "react";
import * as Keycloak from 'keycloak-js';
import { NavLink } from 'react-router-dom';
import { Card } from 'semantic-ui-react';
import strings from "src/localization/strings";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance,
}

class WelcomePage extends React.Component<Props, any> {
  constructor(props: Props) {
    super(props);
  }

  /**
   * Get links
   * 
   * @return array of link objects
   */
  getLinks() {
    return [{
      "text": strings.teams,
      "link": "/teams"
    },{
      "text": strings.products,
      "link": "/products"
    },{
      "text": strings.packageSizes,
      "link": "/packageSizes"
    },{
      "text": strings.seeds,
      "link": "/seeds"
    },{
      "text": strings.productionLines,
      "link": "/productionLines"
    },{
      "text": strings.seedBatches,
      "link": "/seedBatches"
    },{
      "text": strings.performedCultivationActions,
      "link": "/performedCultivationActions"
    },{
      "text": strings.wastageReasons,
      "link": "/wastageReasons"
    }];
  }

  /**
   * Rendr root component view
   */
  render() {
    const links = this.getLinks().map((link) => {
      return (
        <NavLink key={link.link} to={link.link}>
          <Card
            className="content-card"
            header={link.text}
          />
        </NavLink>
      );
    });

    return (
      <Card.Group centered>
        {links}
      </Card.Group>
    );
  }
}

export default WelcomePage;