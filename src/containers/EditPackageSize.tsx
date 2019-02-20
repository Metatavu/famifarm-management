import EditPackageSize from '../components/EditPackageSize';
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { PackageSize } from "famifarm-typescript-models";

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
export function mapStateToProps(state: StoreState) {
  return {
    packageSizes: state.packageSizes,
    packageSize: state.packageSize
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
export function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onPackageSizeSelected: (packageSize: PackageSize) => dispatch(actions.packageSizeSelected(packageSize)),
    onPackageSizeDeleted: (packageSizeId: string) => dispatch(actions.packageSizeDeleted(packageSizeId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditPackageSize);