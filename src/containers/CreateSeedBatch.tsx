import CreateSeedBatch from '../components/CreateSeedBatch';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SeedBatch, Seed } from 'famifarm-client';

export function mapStateToProps(state: StoreState) {
  return {
    seedBatches: state.seedBatches,
    seedBatch: state.seedBatch,
    seeds: state.seeds
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onSeedBatchCreated: (seedBatch: SeedBatch) => dispatch(actions.seedBatchCreated(seedBatch)),
    onSeedsFound: (seeds: Seed[]) => dispatch(actions.seedsFound(seeds))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateSeedBatch);