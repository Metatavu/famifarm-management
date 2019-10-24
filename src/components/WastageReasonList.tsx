import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
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
  onWastageReasonsFound?: (wastageReasons: WastageReason[]) => void,
  onError: (error: ErrorMessage) => void
}

/**
 * Interface representing component state
 */
interface State {
  wastageReasons: WastageReason[];
}

class WastageReasonList extends React.Component<Props, State> {
  
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
    try {
      if (!this.props.keycloak) {
        return;
      }
  
      const wastageReasonsService = await Api.getWastageReasonsService(this.props.keycloak);
      const wastageReasons = await wastageReasonsService.listWastageReasons();
      wastageReasons.sort((a, b) => {
        let nameA = LocalizedUtils.getLocalizedValue(a.reason)
        let nameB = LocalizedUtils.getLocalizedValue(b.reason)
        if(nameA < nameB) { return -1; }
        if(nameA > nameB) { return 1; }
        return 0;
      });
      this.props.onWastageReasonsFound && this.props.onWastageReasonsFound(wastageReasons);
    } catch (e) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Render wastageReason list view
   */
  public render() {
    if (!this.props.wastageReasons) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    const wastageReasons = this.props.wastageReasons.map((wastageReason, i) => {
      const wastageReasonPath = `/wastageReasons/${wastageReason.id}`;
      return (
        <List.Item style={i % 2 == 0 ? {backgroundColor: "#ddd"} : {}} key={wastageReason.id}>
          <List.Content floated='right'>
            <NavLink to={wastageReasonPath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Content>
            <List.Header style={{paddingTop: "10px"}}>{LocalizedUtils.getLocalizedValue(wastageReason.reason)}</List.Header>
          </List.Content>
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
            <List divided animated verticalAlign='middle'>
              {wastageReasons}
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
    wastageReasons: state.wastageReasons,
    wastageReason: state.wastageReason
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onWastageReasonsFound: (wastageReasons: WastageReason[]) => dispatch(actions.wastageReasonsFound(wastageReasons)),
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(WastageReasonList);