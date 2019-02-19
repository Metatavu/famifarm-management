import SeedList from '../components/SeedList';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Seed } from "famifarm-typescript-models";

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    seeds: state.seeds,
    seed: state.seed
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onSeedsFound: (seeds: Seed[]) => dispatch(actions.seedsFound(seeds))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SeedList);