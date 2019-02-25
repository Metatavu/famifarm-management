import PestList from '../components/PestList';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Pest } from "famifarm-typescript-models";

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    pests: state.pests
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onPestsFound: (pests: Pest[]) => dispatch(actions.pestsFound(pests))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PestList);