import TeamList from '../components/TeamList';
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
    onTeamsFound: (teams: Team[]) => dispatch(actions.teamsFound(teams))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamList);