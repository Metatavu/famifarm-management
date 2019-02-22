import * as React from "react";
import { NavLink } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import './styles.css';
import { Menu, Container, Icon, Sidebar } from "semantic-ui-react";
import strings from "../localization/strings";
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";


/**
 * Interface representing component properties
 */
interface Props {
  sidebarItems: JSX.Element[],
  onLocaleUpdate: (locale: string) => void
  locale: string
}

/**
 * Interface representing component state
 */
interface State {
  sidebarOpen: boolean
}

/**
 * React component for basic application layout
 */
class BasicLayout extends React.Component<Props, State> {

  /**
   * Constructor
   * @param props component properties 
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      sidebarOpen: false
    }
  }

  /**
   * Handles sidebar toggling
   */
  private toggleSidebar = () => {
    this.setState({
      sidebarOpen: !this.state.sidebarOpen
    });
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
    return (
      <div>
        <Menu fixed='top' inverted style={{background: "#2AA255"}}>
          <Menu.Item onClick={this.toggleSidebar} name="bars">
            <Icon name="bars" />
          </Menu.Item>
          <Menu.Item as={NavLink} to="/" header>
            {strings.managementHeaderText}
          </Menu.Item>
          <Menu.Item onClick={this.toggleLocale} position={"right"}>{this.props.locale === "fi" ? "In english" : "Suomeksi"}</Menu.Item> 
        </Menu>
        <div style={{marginTop: '0'}}>
          <Sidebar.Pushable>
            <Sidebar 
              as={Menu}
              vertical
              visible={this.state.sidebarOpen}
              width='thin'
              animation='overlay'
              style={{paddingTop: '4em'}}
              inverted
            >
              {this.props.sidebarItems}
            </Sidebar>
            <Sidebar.Pusher>
              <Container style={{minHeight: "100vh", paddingTop: '6em', paddingBottom: '3em'}}>
                {this.props.children}
              </Container>
            </Sidebar.Pusher>
          </Sidebar.Pushable>
        </div>
      </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(BasicLayout);

//export default BasicLayout;