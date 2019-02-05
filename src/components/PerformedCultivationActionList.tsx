import * as React from "react";
import * as Keycloak from 'keycloak-js';
import FamiFarmApiClient from '../api-client';
import { NavLink } from 'react-router-dom';
import { PerformedCultivationAction } from 'famifarm-client';
import strings from "src/localization/strings";

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  performedCultivationActions?: PerformedCultivationAction[];
  onPerformedCultivationActionsFound?: (performedCultivationActions: PerformedCultivationAction[]) => void;
}

export interface State {
  performedCultivationActions: PerformedCultivationAction[];
}

class PerformedCultivationActionsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
        performedCultivationActions: []
    };
  }

  /**
   * Component did mount life-cycle event
   */
  componentDidMount() {
    new FamiFarmApiClient().listPerformedCultivationActions(this.props.keycloak!, 0, 100).then((performedCultivationActions) => {
      this.props.onPerformedCultivationActionsFound && this.props.onPerformedCultivationActionsFound(performedCultivationActions);
    });
  }

  /**
   * Render performedCultivationAction list view
   */
  render() {
    if (!this.props.performedCultivationActions) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader active size="medium" />
        </Grid>
      );
    }

    const performedCultivationActions = this.props.performedCultivationActions.map((performedCultivationAction) => {
      const performedCultivationActionPath = `/performedCultivationActions/${performedCultivationAction.id}`;
      return (
        <List.Item>
          <List.Content floated='right'>
            <NavLink to={performedCultivationActionPath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Header>{performedCultivationAction.name![0].value}</List.Header>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.performedCultivationActions}</h2>
          <NavLink to="/createPerformedCultivationAction">
            <Button className="submit-button">{strings.newPerformedCultivationAction}</Button>
          </NavLink>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List>
              {performedCultivationActions}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default PerformedCultivationActionsList;