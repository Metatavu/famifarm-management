import ProductList from '../components/ProductList';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Product } from "famifarm-typescript-models";

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    products: state.products,
    product: state.product
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onProductsFound: (products: Product[]) => dispatch(actions.productsFound(products))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductList);