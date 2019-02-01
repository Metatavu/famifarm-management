import PackageSizeList from '../components/PackageSizeList';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { PackageSize } from 'famifarm-client';

export function mapStateToProps(state: StoreState) {
  return {
    packageSizes: state.packageSizes,
    packageSize: state.packageSize
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onPackageSizesFound: (packageSizes: PackageSize[]) => dispatch(actions.packageSizesFound(packageSizes))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PackageSizeList);