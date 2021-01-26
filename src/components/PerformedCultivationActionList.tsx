import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { PerformedCultivationAction } from "../generated/client";
import strings from "src/localization/strings";

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";
import LocalizedUtils from "src/localization/localizedutils";

export interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  performedCultivationActions?: PerformedCultivationAction[];
  onPerformedCultivationActionsFound?: (performedCultivationActions: PerformedCultivationAction[]) => void,
  onError: (error: ErrorMessage) => void
}

export interface State {
  performedCultivationActions: PerformedCultivationAction[];
}

class PerformedCultivationActionList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
        performedCultivationActions: []
    };
  }

  /**
   * Component did mount life-sycle event
   */
  async componentDidMount() {
    try {
      if (!this.props.keycloak) {
        return;
      }
  
      const performedCultivationActionServer = await Api.getPerformedCultivationActionsService(this.props.keycloak);
      const performedCultivationActions = await performedCultivationActionServer.listPerformedCultivationActions({});
      
      this.props.onPerformedCultivationActionsFound && this.props.onPerformedCultivationActionsFound(performedCultivationActions);
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Render performedCultivationAction list view
   */
  render() {
    if (!this.props.performedCultivationActions) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }
    
    const performedCultivationActions = this.props.performedCultivationActions.map((performedCultivationAction, i) => {
      const performedCultivationActionPath = `/performedCultivationActions/${performedCultivationAction.id}`;
      return (
        <List.Item style={i % 2 == 0 ? {backgroundColor: "#ddd"} : {}} key={performedCultivationAction.id}>
          <List.Content floated='right'>
            <NavLink to={performedCultivationActionPath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Content>
            <List.Header style={{paddingTop: "10px"}}>{LocalizedUtils.getLocalizedValue(performedCultivationAction.name)}</List.Header>
          </List.Content>
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
            <List divided animated verticalAlign='middle'>
              {performedCultivationActions}
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
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
    performedCultivationActions: state.performedCultivationActions,
    performedCultivationAction: state.performedCultivationAction
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onPerformedCultivationActionsFound: (performedCultivationActions: PerformedCultivationAction[]) => dispatch(actions.performedCultivationActionsFound(performedCultivationActions)),
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PerformedCultivationActionList);