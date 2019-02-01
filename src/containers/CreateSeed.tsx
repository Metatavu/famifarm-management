import CreateSeed from '../components/CreateSeed';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Seed } from 'famifarm-client';

export function mapStateToProps(state: StoreState) {
  return {
    seeds: state.seeds,
    seed: state.seed
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onSeedCreated: (seed: Seed) => dispatch(actions.seedCreated(seed))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateSeed);