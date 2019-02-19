import EditProductionLine from '../components/EditProductionLine';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ProductionLine } from 'famifarm-client';

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
    onProductionLineSelected: (productionLine: ProductionLine) => dispatch(actions.productionLineSelected(productionLine)),
    onProductionLineDeleted: (productionLineId: string) => dispatch(actions.productionLineDeleted(productionLineId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditProductionLine);