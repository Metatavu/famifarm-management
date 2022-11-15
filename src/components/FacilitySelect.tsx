import * as React from "react";
import { Dropdown } from "semantic-ui-react";
import strings from "../localization/strings";
import * as actions from "../actions";
import { StoreState } from "../types/index";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Facility } from "../generated/client";


/**
 * Interface representing component properties
 */
interface Props {
  facility: Facility;
  onFacilityChange: (facility: Facility) => void;
}

/**
 * Interface representing component state
 */
interface State {}

/**
 * React component for facility select
 */
class FacilitySelect extends React.Component<Props, State> {

  /**
   * Constructor
   * @param props component properties 
   */
  constructor(props: Props) {
    super(props);
    this.state = {
    }
  }

  /**
   * Render facility select
   */
  render() {
    const { facility, onFacilityChange } = this.props;
    if (!facility) {
      return null;
    }

    return (
      <Dropdown position="right" item text={ facility }>
        <Dropdown.Menu>
          <Dropdown.Item
            value={ facility == Facility.Joroinen ? Facility.Juva : Facility.Joroinen }
            onClick={ (event, item) => { onFacilityChange(item.value as Facility) } }
          >
            { facility == Facility.Joroinen ? Facility.Juva : Facility.Joroinen }
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
function mapStateToProps(state: StoreState) {
  return {
    facility: state.facility
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<actions.AppAction>) {
  return {
    onFacilityChange: (facility: Facility) => dispatch(actions.facilityUpdate(facility))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FacilitySelect);
