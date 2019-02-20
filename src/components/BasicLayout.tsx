import * as React from "react";
import { NavLink } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import './styles.css';
import { Menu, Container, Icon, Sidebar } from "semantic-ui-react";
import strings from "../localization/strings";

/**
 * Interface representing component properties
 */
interface Props {
  sidebarItems: JSX.Element[]
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

export default BasicLayout;