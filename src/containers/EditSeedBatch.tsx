import EditSeedBatch from '../components/EditSeedBatch';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SeedBatch, Seed } from 'famifarm-client';

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    seedBatches: state.seedBatches,
    seedBatch: state.seedBatch,
    seeds: state.seeds
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onSeedBatchSelected: (seedBatch: SeedBatch) => dispatch(actions.seedBatchSelected(seedBatch)),
    onSeedBatchDeleted: (seedBatchId: string) => dispatch(actions.seedBatchDeleted(seedBatchId)),
    onSeedsFound: (seeds: Seed[]) => dispatch(actions.seedsFound(seeds))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditSeedBatch);