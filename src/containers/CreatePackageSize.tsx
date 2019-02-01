import CreatePackageSize from '../components/CreatePackageSize';
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
    onPackageSizeCreated: (packageSize: PackageSize) => dispatch(actions.packageSizeCreated(packageSize))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePackageSize);