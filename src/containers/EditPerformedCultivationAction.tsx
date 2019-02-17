import EditPerformedCultivationAction from '../components/EditPerformedCultivationAction';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { PerformedCultivationAction } from "famifarm-typescript-models";

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
    onPerformedCultivationActionSelected: (performedCultivationAction: PerformedCultivationAction) => dispatch(actions.performedCultivationActionSelected(performedCultivationAction)),
    onPerformedCultivationActionDeleted: (performedCultivationActionId: string) => dispatch(actions.performedCultivationActionDeleted(performedCultivationActionId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditPerformedCultivationAction);