import * as React from "react";
import { NavLink } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import './styles.css';
import { Grid } from "semantic-ui-react";
import strings from "../localization/strings";

class BasicLayout extends React.Component {

  /**
   * Render basic layout
   */
  render() {
    return (
      <div>
        <Grid padded>
          <Grid.Row className="header-row">
            <Grid.Column width={16}>
            <NavLink to="/">
              <h2 className="header-text">{strings.managementHeaderText}</h2>
            </NavLink>
              
            </Grid.Column>
          </Grid.Row>

          {this.props.children}
        </Grid>
      </div>
    );
  }
}

export default BasicLayout;