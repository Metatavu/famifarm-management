import CreateTeam from '../components/CreateTeam';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Team } from 'famifarm-client';

export function mapStateToProps(state: StoreState) {
  return {
    teams: state.teams,
    team: state.team
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onTeamCreated: (team: Team) => dispatch(actions.teamCreated(team))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateTeam);