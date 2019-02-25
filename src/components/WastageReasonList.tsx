import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { WastageReason } from "famifarm-typescript-models";
import strings from "src/localization/strings";

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";
import LocalizedUtils from "src/localization/localizedutils";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  wastageReasons?: WastageReason[];
  onWastageReasonsFound?: (wastageReasons: WastageReason[]) => void;
}

/**
 * Interface representing component state
 */
interface State {
  wastageReasons: WastageReason[];
}

class WastageReasonsList extends React.Component<Props, State> {
  
  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      wastageReasons: []
    };
  }

  /**
   * Component did mount life-sycle event
   */
  public async componentDidMount() {
    if (!this.props.keycloak) {
      return;
    }

    const wastageReasonsService = await Api.getWastageReasonsService(this.props.keycloak);
    wastageReasonsService.listWastageReasons().then((wastageReasons) => {
      this.props.onWastageReasonsFound && this.props.onWastageReasonsFound(wastageReasons);
    });
  }

  /**
   * Render wastageReason list view
   */
  public render() {
    if (!this.props.wastageReasons) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader active size="medium" />
        </Grid>
      );
    }

    const wastageReasons = this.props.wastageReasons.map((wastageReason) => {
      const wastageReasonPath = `/wastageReasons/${wastageReason.id}`;
      return (
        <List.Item key={wastageReason.id}>
          <List.Content floated='right'>
            <NavLink to={wastageReasonPath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Header>{LocalizedUtils.getLocalizedValue(wastageReason.reason)}</List.Header>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{strings.wastageReasons}</h2>
          <NavLink to="/createWastageReason">
            <Button className="submit-button">{strings.newWastageReason}</Button>
          </NavLink>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List>
              {wastageReasons}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default WastageReasonsList;