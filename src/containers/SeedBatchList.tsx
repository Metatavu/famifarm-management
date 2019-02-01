import SeedBatchList from '../components/SeedBatchList';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SeedBatch } from 'famifarm-client';

export function mapStateToProps(state: StoreState) {
  return {
    seedBatches: state.seedBatches,
    seedBatch: state.seedBatch
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onSeedBatchesFound: (seedBatches: SeedBatch[]) => dispatch(actions.seedBatchesFound(seedBatches))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SeedBatchList);