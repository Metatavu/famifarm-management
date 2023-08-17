import * as React from "react";
import 'semantic-ui-css/semantic.min.css';
import '../components/styles.css';
import { Menu } from "semantic-ui-react";
import strings from "../localization/strings";
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Navigate } from 'react-router-dom';
import { Facility } from "../generated/client";


/**
 * Interface representing component properties
 */
interface Props {
  onLocaleUpdate: (locale: string) => void;
  locale: string;
  facility: Facility;
}

/**
 * Interface representing component state
 */
interface State {
  languageChanged: boolean
}

/**
 * React component for basic application layout
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
   * Component did update lifecycle method
   *
   * @param prevProps previous properties
   */
  componentDidUpdate(prevProps: Props) {
    if (this.state.languageChanged) {
      this.setState({ languageChanged: false });
    }
    else if (prevProps.locale !== this.props.locale) {
      this.setState({ languageChanged: true });
    }
  }
  /**
   * Toggles selected language
   */
  private toggleLocale = () => {
    const currentLocale = strings.getLanguage();
    if (currentLocale.includes("fi")) {
      strings.setLanguage(`en_${this.props.facility.toLowerCase()}`);
      this.props.onLocaleUpdate(`en_${this.props.facility.toLowerCase()}`);
    } else {
      strings.setLanguage(`fi_${this.props.facility.toLowerCase()}`);
      this.props.onLocaleUpdate(`fi_${this.props.facility.toLowerCase()}`);
    }
  }

  /**
   * Render basic layout
   */
  render() {
    if (this.state.languageChanged) {
      return <Navigate replace={true} to="/"/>;
    }
    return (
      <Menu.Item onClick={() => this.toggleLocale()} position={"right"}>
        {this.props.locale.includes("fi") ? "In english" : "Suomeksi"}
      </Menu.Item>
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
    locale: state.locale,
    facility: state.facility
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onLocaleUpdate: (locale: string) => dispatch(actions.localeUpdate(locale))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ToggleLocalization);
