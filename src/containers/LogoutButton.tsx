import * as React from "react";
import { Dropdown } from "semantic-ui-react";
import strings from "../localization/strings";
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { KeycloakInstance } from "keycloak-js";


/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: KeycloakInstance
}

/**
 * Interface representing component state
 */
interface State {}

/**
 * React component for logout menu item
 */
class ToggleLocalization extends React.Component<Props, State> {

  /**
   * Constructor
   * @param props component properties 
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      languageChanged: false
    }
  }

  /**
   * Render logout menu item
   */
  render() {
    if (!this.props.keycloak) {
      return null;
    }

    const tokenParsed = this.props.keycloak.tokenParsed as any;
    const displayName =  tokenParsed.name ? tokenParsed.name : tokenParsed.preferred_username;
    const accountUrl = this.props.keycloak.createAccountUrl();
    const logoutUrl = this.props.keycloak.createLogoutUrl();

    return (
      <Dropdown position="right" item text={displayName}>
        <Dropdown.Menu>
          <Dropdown.Item as="a" href={accountUrl}>{strings.accountUrl}</Dropdown.Item>
          <Dropdown.Item as="a" href={logoutUrl}>{strings.logoutUrl}</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
function mapStateToProps(state: StoreState) {
  return {
    keycloak: state.keycloak
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return { };
}

export default connect(mapStateToProps, mapDispatchToProps)(ToggleLocalization);
