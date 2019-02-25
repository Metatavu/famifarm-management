import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Pest } from "famifarm-typescript-models";
import strings from "src/localization/strings";

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";
import LocalizedUtils from "src/localization/localizedutils";

/**
 * Component props
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  pests?: Pest[];
  onPestsFound?: (pests: Pest[]) => void;
}

/**
 * Component state
 */
interface State {
  pests: Pest[];
}

class PestsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pests: []
    };
  }

  /**
   * Component did mount life-sycle event
   */
  public async componentDidMount() {
    if (!this.props.keycloak) {
      return;
    }

    const pestsService = await Api.getPestsService(this.props.keycloak);
    pestsService.listPests().then((pests) => {
      this.props.onPestsFound && this.props.onPestsFound(pests);
    });
  }

  /**
   * Render pest list view
   */
  public render() {
    if (!this.props.pests) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader active size="medium" />
        </Grid>
      );
    }

    const pests = this.props.pests.map((pest) => {
      const pestPath = `/pests/${pest.id}`;
      return (
        <List.Item key={pest.id}>
          <List.Content floated='right'>
            <NavLink to={pestPath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Header>{LocalizedUtils.getLocalizedValue(pest.name)}</List.Header>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.pests}</h2>
          <NavLink to="/createPest">
            <Button className="submit-button">{strings.newPest}</Button>
          </NavLink>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List>
              {pests}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default PestsList;