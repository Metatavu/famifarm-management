import EditWastageReason from '../components/EditWastageReason';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { WastageReason } from "famifarm-typescript-models";

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    wastageReasons: state.wastageReasons,
    wastageReason: state.wastageReason
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onWastageReasonSelected: (wastageReason: WastageReason) => dispatch(actions.wastageReasonSelected(wastageReason)),
    onWastageReasonDeleted: (wastageReasonId: string) => dispatch(actions.wastageReasonDeleted(wastageReasonId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditWastageReason);