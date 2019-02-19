import CreateProductionLine from '../components/CreateProductionLine';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ProductionLine } from "famifarm-typescript-models";

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    productionLines: state.productionLines,
    productionLine: state.productionLine
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onProductionLineCreated: (productionLine: ProductionLine) => dispatch(actions.productionLineCreated(productionLine))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateProductionLine);