import EditTeam from '../components/EditTeam';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Team } from 'famifarm-client';

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    teams: state.teams,
    team: state.team
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onTeamSelected: (team: Team) => dispatch(actions.teamSelected(team)),
    onTeamDeleted: (teamId: string) => dispatch(actions.teamDeleted(teamId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditTeam);