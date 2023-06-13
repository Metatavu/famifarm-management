import * as React from "react";
import { Item, Dropdown } from "semantic-ui-react";
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Facility } from "../generated/client";
import strings from "../localization/strings";

/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  facility: Facility;
  onFacilityChange: (facility: Facility) => void;
  onLocaleUpdate: (locale: string) => void;
  locale: string;
}

/**
 * Interface representing component state
 */
interface State {}

/**
 * React component for facility select
 */
class FacilitySelect extends React.Component<Props, State> {

  /**
   * Constructor
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
    }
  }

  /**
   * Render facility select
   */
  render() {
    const { facility, keycloak } = this.props;
    if (!facility || !keycloak) {
      return null;
    }

    if (keycloak.hasRealmRole("juva") && keycloak.hasRealmRole("joroinen")) {
      return (
        <Dropdown position="right" item text={ facility }>
          <Dropdown.Menu>
            <Dropdown.Item
              value={ facility === Facility.Joroinen ? Facility.Juva : Facility.Joroinen }
              onClick={ (event, item) => { this.handleFacilityChange(item.value as Facility) } }
            >
              { facility === Facility.Joroinen ? Facility.Juva : Facility.Joroinen }
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    } else {
      return (
        <Item>{ keycloak.hasRealmRole("joroinen") ? Facility.Joroinen : Facility.Juva }</Item>
      );
    }
  }

  /**
   * Handle facility change
   * @param facility
   */
  private handleFacilityChange = (facility: Facility) => {
    const { locale, onFacilityChange, onLocaleUpdate } = this.props;

    if (this.props.facility !== facility) {
      window.localStorage.setItem("facility", facility);
      onFacilityChange(facility);

      strings.setLanguage(`${locale.slice(0, 2)}_${facility.toLowerCase()}`);
      onLocaleUpdate(`${locale.slice(0, 2)}_${facility.toLowerCase()}`);

      // TODO: Removing this updates the locales and returns user to welcome screen. Leaving it in does not navigate, but does not update locales either.
      // window.location.reload();
    }
  }
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: StoreState) {
  return {
    facility: state.facility,
    keycloak: state.keycloak,
    locale: state.locale
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onFacilityChange: (facility: Facility) => dispatch(actions.facilityUpdate(facility)),
    onLocaleUpdate: (locale: string) => dispatch(actions.localeUpdate(locale))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FacilitySelect);
