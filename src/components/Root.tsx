import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { NavLink } from 'react-router-dom';
import { Card } from 'semantic-ui-react';

export interface Props {
  keycloak?: Keycloak.KeycloakInstance,
}

class WelcomePage extends React.Component<Props, any> {
  constructor(props: Props) {
    super(props);
    this.state = {
        teams: []
    };
  }

  componentDidMount() {
    const apiClient = new FamiFarmApiClient();
    const teams = apiClient.listTeams(this.props.keycloak!, 0, 100);

    this.setState({teams: teams});
  }

  getLinks() {
    return [{
      "text": "Tiimit",
      "link": "/teams"
    },{
      "text": "Tuotteet",
      "link": "/products"
    },{
      "text": "Pakkauskoot",
      "link": "/packageSizes"
    },{
      "text": "Siemenet",
      "link": "/seeds"
    }];
  }

  render() {
    const links = this.getLinks().map((link) => {
      return (
        <NavLink to={link.link}>
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