import * as React from "react";
import * as actions from "../actions";
import { NavLink } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import './styles.css';
import { Menu, Container, Icon, Sidebar, Message } from "semantic-ui-react";
import strings from "../localization/strings";
import ToggleLocalization from "./ToggleLocalization";
import LogoutButton from "./LogoutButton";
import { ErrorMessage, StoreState } from "../types";
import { connect } from "react-redux";
import { Dispatch } from "redux";

/**
 * Interface representing component properties
 */
interface Props {
  sidebarItems: JSX.Element[],
  error?: ErrorMessage
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
   * Render basic layout
   */
  public render() {
    return (
      <div>
        <Menu fixed='top' inverted style={{background: "#2AA255"}}>
          <Menu.Item onClick={this.toggleSidebar.bind(this)} name="bars">
            <Icon name="bars" />
          </Menu.Item>
          <Menu.Item as={NavLink} to="/" header>
            {strings.managementHeaderText}
          </Menu.Item>
          <ToggleLocalization />
          <LogoutButton />
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
                {
                  this.renderError()
                }
                {this.props.children}
              </Container>
            </Sidebar.Pusher>
          </Sidebar.Pushable>
        </div>
      </div>
    );
  }

  private renderError() {
    if (!this.props.error) {
      return null;
    }

    return <Message negative>
      { this.props.error.title ? <Message.Header>{this.props.error.title}</Message.Header> : null }
      <p>{ this.props.error.message ? this.props.error.message : "" }. { strings.errorRetryText } <a href="javascript:window.location.reload(true)">{ strings.errorRetryHere }</a></p>
      <p>{ strings.errorSupportText }</p>
    </Message>
  }

}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    error: state.error
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(BasicLayout);