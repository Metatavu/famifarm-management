import * as React from "react";
import * as Keycloak from 'keycloak-js';
import Api from "../api";
import { NavLink } from 'react-router-dom';
import { Campaign } from "famifarm-typescript-models";
import strings from "src/localization/strings";
import * as actions from "../actions";
import { StoreState, ErrorMessage } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  List,
  Button,
  Grid,
  Loader
} from "semantic-ui-react";


/**
 * Interface representing component properties
 */
interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  campaigns?: Campaign[];
  onCampaignsFound?: (campaigns: Campaign[]) => void;
  onError: (error: ErrorMessage) => void;
}

/**
 * Interface representing component state
 */
interface State {
  campaigns: Campaign[]
  loading: boolean
}

/**
 * React component for displaying list of packings
 */
class CampaignList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      campaigns: [],
      loading: false,
    };
  }

  /**
   * Component did mount life-sycle event
   */
  public async componentDidMount() {
    try {
      await this.updateCampaigns();
    } catch (exception) {
      this.props.onError({
        message: strings.defaultApiErrorMessage,
        title: strings.defaultApiErrorTitle,
        exception
      });
    }
  }

  /**
   * Render campaigns list view
   */
  public render() {
    if (this.state.loading) {
      return (
        <Grid style={{paddingTop: "100px"}} centered>
          <Loader inline active size="medium" />
        </Grid>
      );
    }

    const campaigns = (this.props.campaigns || []).map((campaign, i) => {
      return (
        <List.Item style={i % 2 == 0 ? {backgroundColor: "#ddd"} : {}} key={campaign.id}>
          <List.Content floated='right'>
            <NavLink to={`/campaigns/${campaign.id}`}>
              <Button className="submit-button">{strings.open}</Button>
            </NavLink>
          </List.Content>
          <List.Content>
            <List.Header style={{paddingTop: "10px"}}>{ campaign.name }</List.Header>
          </List.Content>
        </List.Item>
      );
    });

    return (
      <Grid>
        <Grid.Row className="content-page-header-row" style={{flex: 1,justifyContent: "space-between", paddingLeft: 10, paddingRight: 10}}>
          <h2>{ strings.campaigns }</h2>
          <NavLink to="/createCampaign">
            <Button className="submit-button">{ strings.newCampaign }</Button>
          </NavLink>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <List divided animated verticalAlign='middle'>
              { campaigns }
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }


  /**
   * Updates campaigns list
   */
  private updateCampaigns = async () => {
    if (!this.props.keycloak) {
      return;
    }

    this.setState({loading: true});
    
    const campaignsService = await Api.getCampaignsService(this.props.keycloak);
    const campaigns = await campaignsService.listCampaigns();
    this.props.onCampaignsFound && this.props.onCampaignsFound(campaigns);
    this.setState({loading: false})
  }
}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    campaigns: state.campaigns
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onCampaignsFound: (campaigns: Campaign[]) => dispatch(actions.campaignsFound(campaigns)),
    onError: (error: ErrorMessage) => dispatch(actions.onErrorOccurred(error))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CampaignList);