import ProductionLineList from '../components/ProductionLineList';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ProductionLine } from 'famifarm-client';

export function mapStateToProps(state: StoreState) {
  return {
    productionLines: state.productionLines,
    productionLine: state.productionLine
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onProductionLinesFound: (productionLines: ProductionLine[]) => dispatch(actions.productionLinesFound(productionLines))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductionLineList);