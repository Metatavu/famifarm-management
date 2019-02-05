import PerformedCultivationActionList from '../components/PerformedCultivationActionList';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { PerformedCultivationAction } from 'famifarm-client';

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    performedCultivationActions: state.performedCultivationActions,
    performedCultivationAction: state.performedCultivationAction
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onPerformedCultivationActionsFound: (performedCultivationActions: PerformedCultivationAction[]) => dispatch(actions.performedCultivationActionsFound(performedCultivationActions))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PerformedCultivationActionList);