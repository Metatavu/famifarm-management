import CreateProduct from '../components/CreateProduct';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Product, PackageSize } from 'famifarm-client';

export function mapStateToProps(state: StoreState) {
  return {
    products: state.products,
    product: state.product,
    packageSizes: state.packageSizes
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onProductCreated: (product: Product) => dispatch(actions.productCreated(product)),
    onPackageSizesFound: (packageSizes: PackageSize[]) => dispatch(actions.packageSizesFound(packageSizes))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateProduct);