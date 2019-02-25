import * as React from "react";
import 'semantic-ui-css/semantic.min.css';
import '../components/styles.css';
import { Menu } from "semantic-ui-react";
import strings from "../localization/strings";
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Redirect } from 'react-router';


/**
 * Interface representing component properties
 */
interface Props {
  onLocaleUpdate: (locale: string) => void
  locale: string
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
    if (currentLocale === "fi") {
      strings.setLanguage("en");
      this.props.onLocaleUpdate("en");
    } else {
      strings.setLanguage("fi");
      this.props.onLocaleUpdate("fi");
    }
  }

  /**
   * Render basic layout
   */
  render() {
    if (this.state.languageChanged) {
      return (
        <Redirect to="/" />
      );
    }
    return (
      <Menu.Item onClick={() => this.toggleLocale()} position={"right"}>
        {this.props.locale === "fi" ? "In english" : "Suomeksi"}
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
    onLocaleUpdate: (locale: string) => dispatch(actions.localeUpdate(locale))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ToggleLocalization);
