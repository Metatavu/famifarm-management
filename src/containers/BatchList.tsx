import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Product, Batch } from "famifarm-typescript-models";
import BatchList from 'src/components/BatchList';

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    products: state.products,
    batches: state.batches
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onProductsFound: (products: Product[]) => dispatch(actions.productsFound(products)),
    onBatchesFound: (batches: Batch[]) => dispatch(actions.batchesFound(batches))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchList);