import * as React from "react";
import * as Keycloak from 'keycloak-js';
import * as actions from "../actions";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Facility, Pest } from "../generated/client";
import strings from "../localization/strings";

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";
import LocalizedUtils from "../localization/localizedutils";

/**
 * Component props
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  pests?: Pest[];
  facility: Facility;
  onPestsFound?: (pests: Pest[]) => void,
  onError: (error: ErrorMessage | undefined) => void
}

/**
 * Component state
 */
interface State {
  pests: Pest[];
}

class PestList extends React.Component<Props, State> {
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
    const { keycloak, facility, onError, onPestsFound } = this.props;
    try {
      if (!keycloak) {
        return;
      }
  
      const pestsService = await Api.getPestsService(keycloak);
      const pests = await pestsService.listPests({ facility: facility });
      pests.sort((a, b) => {
        let nameA = LocalizedUtils.getLocalizedValue(a.name)
        let nameB = LocalizedUtils.getLocalizedValue(b.name)
        if(nameA < nameB) { return -1; }
        if(nameA > nameB) { return 1; }
        return 0;
      });
      onPestsFound && onPestsFound(pests);
    } catch (e: any) {
      onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception: e
      });
    }
  }

  /**
   * Render pest list view
   */
  public render() {
    if (!this.props.pests) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    const pests = this.props.pests.map((pest, i) => {
      const pestPath = `/pests/${pest.id}`;
      return (
        <List.Item style={i % 2 == 0 ? {backgroundColor: "#ddd"} : {}} key={pest.id}>
          <List.Content floated='right'>
            <NavLink to={pestPath}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Content>
            <List.Header style={{paddingTop: "10px"}}>{LocalizedUtils.getLocalizedValue(pest.name)}</List.Header>
          </List.Content>
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
            <List divided animated verticalAlign='middle'>
              {pests}
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
    pests: state.pests,
    facility: state.facility
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onPestsFound: (pests: Pest[]) => dispatch(actions.pestsFound(pests)),
     onError: (error: ErrorMessage | undefined) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PestList);