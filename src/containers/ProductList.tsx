import ProductList from '../components/ProductList';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Product } from 'famifarm-client';

export function mapStateToProps(state: StoreState) {
  return {
    products: state.products,
    product: state.product
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onProductsFound: (products: Product[]) => dispatch(actions.productsFound(products))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductList);